import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { CreditCard } from '../models/credit-card.model';
import { Invoice } from '../models/invoice.model';
import { AuthStateService } from './auth-state.service';
import { EventService } from './event.service';
import { LocalPurchaseRepository } from './purchase.repository';
import { PurchaseService } from './purchase.service';

describe('PurchaseService', () => {
  const card: CreditCard = {
    cardholderName: 'Julia Adell',
    cardNumber: '4111111111111111',
    expiryMonth: '12',
    expiryYear: '2030',
    securityCode: '123',
    issuer: 'VISA',
  };
  const invoice: Invoice = {
    eventId: 7,
    eventName: 'Festival',
    eventDate: '2026-07-20',
    venueName: 'Parc del Fòrum',
    concept: '2 entradas para Festival',
    ticketQuantity: 2,
    unitPrice: 17.5,
    totalAmount: 35,
  };

  let service: PurchaseService;
  let http: HttpTestingController;
  let saveTransaction: ReturnType<typeof vi.fn>;
  let removeTransactionById: ReturnType<typeof vi.fn>;
  let idToken: string | null;
  let findTransactionById: ReturnType<typeof vi.fn>;
  let findEventById: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    saveTransaction = vi.fn();
    removeTransactionById = vi.fn();
    idToken = 'firebase-id-token';
    findTransactionById = vi.fn();
    findEventById = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        PurchaseService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthStateService,
          useValue: { getIdToken: () => idToken },
        },
        {
          provide: LocalPurchaseRepository,
          useValue: {
            save: saveTransaction,
            findByUser: vi.fn(),
            removeById: removeTransactionById,
            findById: findTransactionById,
          },
        },
        {
          provide: EventService,
          useValue: { findEventById },
        },
      ],
    });
    service = TestBed.inject(PurchaseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía la compra a la pasarela mediante POST', () => {
    service.buyTickets('USER@EXAMPLE.COM', card, invoice).subscribe();

    const request = http.expectOne(
      'http://teacherbanking.us-east-1.elasticbeanstalk.com/pasarela/compra',
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.has('Authorization')).toBe(false);
    expect(request.request.body).toEqual({
      nombreTitular: 'Julia Adell',
      numeroTarjeta: '4111111111111111',
      mesCaducidad: '12',
      yearCaducidad: '2030',
      cvv: '123',
      emisor: 'VISA',
      concepto: '2 entradas para Festival',
      cantidad: '35.00',
    });
    request.flush({ status: 'OK', message: ['200.0001'] });
  });

  it('no llama a la pasarela cuando no existe un token de sesión', async () => {
    idToken = null;

    await expect(
      firstValueFrom(service.buyTickets('user@example.com', card, invoice)),
    ).rejects.toThrow('No existe una sesión válida para registrar la compra.');
    http.expectNone('http://teacherbanking.us-east-1.elasticbeanstalk.com/pasarela/compra');
    expect(saveTransaction).not.toHaveBeenCalled();
  });

  it('persiste la transacción aprobada sin almacenar los datos de tarjeta', () => {
    service.buyTickets(' USER@EXAMPLE.COM ', card, invoice).subscribe();

    http
      .expectOne('http://teacherbanking.us-east-1.elasticbeanstalk.com/pasarela/compra')
      .flush({ status: 'OK', message: ['200.0001'] });

    expect(saveTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        userEmail: 'user@example.com',
        invoice,
      }),
    );
    const storedTransaction = saveTransaction.mock.calls[0][0];
    expect(Object.keys(storedTransaction).sort()).toEqual([
      'createdAt',
      'id',
      'invoice',
      'userEmail',
    ]);
    expect(storedTransaction.invoice).toEqual(invoice);
    expect(storedTransaction).not.toHaveProperty('cardNumber');
    expect(storedTransaction).not.toHaveProperty('securityCode');
  });

  it('no persiste la transacción cuando la pasarela rechaza la compra', () => {
    service.buyTickets('user@example.com', card, invoice).subscribe();

    http
      .expectOne('http://teacherbanking.us-east-1.elasticbeanstalk.com/pasarela/compra')
      .flush({ status: 'KO', message: ['400.0001'] });

    expect(saveTransaction).not.toHaveBeenCalled();
  });

  it('cancela una compra del usuario autenticado', async () => {
    removeTransactionById.mockReturnValue(true);

    await expect(
      firstValueFrom(service.cancelPurchase('transaction-1', 'user@example.com')),
    ).resolves.toBe(true);
    expect(removeTransactionById).toHaveBeenCalledWith('transaction-1', 'user@example.com');
  });

  it('no intenta cancelar una compra sin un token de sesión', async () => {
    idToken = null;

    await expect(
      firstValueFrom(service.cancelPurchase('transaction-1', 'user@example.com')),
    ).rejects.toThrow('No existe una sesión válida para cancelar la compra.');
    expect(removeTransactionById).not.toHaveBeenCalled();
  });

  it('recupera una compra por identificador para el usuario autenticado', () => {
    const transaction = {
      id: 'transaction-1',
      userEmail: 'user@example.com',
      createdAt: '2026-07-17T10:00:00.000Z',
      invoice,
    };
    findTransactionById.mockReturnValue(transaction);

    service.getPurchaseById('transaction-1', 'user@example.com').subscribe((result) => {
      expect(result).toEqual(transaction);
    });

    expect(findTransactionById).toHaveBeenCalledWith('transaction-1', 'user@example.com');
  });

  it('recupera el detalle de la entrada y completa los datos del festival', async () => {
    const transaction = {
      id: 'transaction-1',
      userEmail: 'user@example.com',
      createdAt: '2026-07-17T10:00:00.000Z',
      invoice,
    };
    const event = {
      id: 7,
      nombre: 'Festival',
      descripcion: 'Festival de verano',
      fechaEvento: '2026-07-20',
      horaEvento: { hour: 21, minute: 0, second: 0, nano: 0 },
      precioMinimo: 17.5,
      precioMaximo: 35,
      localidad: 'Barcelona',
      genero: 'Música',
      nombreRecinto: 'Parc del Fòrum',
      imagenUrl: 'https://example.com/festival.jpg',
    };
    findTransactionById.mockReturnValue(transaction);
    findEventById.mockReturnValue(of(event));

    await expect(
      firstValueFrom(service.getTicketDetail('transaction-1', 'user@example.com')),
    ).resolves.toEqual({ transaction, event });
    expect(findEventById).toHaveBeenCalledWith(7);
  });

  it('no consulta el festival si la entrada no existe o pertenece a otro usuario', async () => {
    findTransactionById.mockReturnValue(null);

    await expect(
      firstValueFrom(service.getTicketDetail('missing', 'user@example.com')),
    ).resolves.toBeNull();
    expect(findEventById).not.toHaveBeenCalled();
  });

  it.each([
    ['400.0001', 'La tarjeta no dispone de fondos suficientes.'],
    ['400.0002', 'No se ha encontrado el usuario asociado a la compra.'],
    ['400.0003', 'El número de tarjeta no es válido.'],
    ['400.0004', 'El código de seguridad no es válido.'],
    ['400.0005', 'El mes de caducidad no es válido.'],
    ['400.0006', 'El año de caducidad no es válido.'],
    ['400.0007', 'La tarjeta está caducada.'],
    ['400.0008', 'El nombre del titular no tiene un formato válido.'],
    ['500.0001', 'La pasarela de pago no está disponible temporalmente.'],
  ])('traduce el código %s a un mensaje comprensible', (code, expectedMessage) => {
    expect(service.validatePurchase({ status: 'KO', message: [code] })).toEqual({
      successful: false,
      code,
      message: expectedMessage,
    });
  });

  it('reconoce la respuesta correcta de la pasarela', () => {
    expect(service.validatePurchase({ status: 'OK', message: ['200.0001'] })).toEqual({
      successful: true,
      code: '200.0001',
      message: 'Compra registrada correctamente.',
    });
  });
});
