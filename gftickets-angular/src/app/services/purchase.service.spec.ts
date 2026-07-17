import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CreditCard } from '../models/credit-card.model';
import { Invoice } from '../models/invoice.model';
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

  beforeEach(() => {
    saveTransaction = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        PurchaseService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: LocalPurchaseRepository,
          useValue: { save: saveTransaction, findByUser: vi.fn() },
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
    expect(JSON.stringify(storedTransaction)).not.toContain(card.cardNumber);
    expect(JSON.stringify(storedTransaction)).not.toContain(card.securityCode);
  });

  it('no persiste la transacción cuando la pasarela rechaza la compra', () => {
    service.buyTickets('user@example.com', card, invoice).subscribe();

    http
      .expectOne('http://teacherbanking.us-east-1.elasticbeanstalk.com/pasarela/compra')
      .flush({ status: 'KO', message: ['400.0001'] });

    expect(saveTransaction).not.toHaveBeenCalled();
  });

  it.each([
    ['400.0001', 'La tarjeta no dispone de fondos suficientes.'],
    ['400.0002', 'Faltan datos obligatorios para procesar la compra.'],
    ['400.0003', 'El número de tarjeta no es válido.'],
    ['400.0004', 'El código de seguridad no es válido.'],
    ['400.0005', 'El mes de caducidad no es válido.'],
    ['400.0006', 'El año de caducidad no es válido.'],
    ['400.0007', 'La tarjeta está caducada.'],
    ['400.0008', 'El nombre del titular no tiene un formato válido.'],
    ['500.0001', 'La pasarela de pago no está disponible temporalmente.'],
  ])('traduce el código %s a un mensaje comprensible', (code, expectedMessage) => {
    expect(service.interpretResponse({ status: 'KO', message: [code] })).toEqual({
      successful: false,
      code,
      message: expectedMessage,
    });
  });

  it('reconoce la respuesta correcta de la pasarela', () => {
    expect(service.interpretResponse({ status: 'OK', message: ['200.0001'] })).toEqual({
      successful: true,
      code: '200.0001',
      message: 'Compra registrada correctamente.',
    });
  });
});
