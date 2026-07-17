import { HttpErrorResponse } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';

import { RespuestaCompra } from '../../models/compra-entrada.model';
import { Evento } from '../../models/evento.model';
import { EventService } from '../../services/event.service';
import { PurchaseService } from '../../services/purchase.service';
import { USER_SERVICE } from '../../services/user.service';
import { PurchaseComponent } from './purchase';

registerLocaleData(localeEs);

describe('PurchaseComponent', () => {
  const event: Evento = {
    id: 7,
    nombre: 'Anochecer Sinfónico',
    descripcion: 'Concierto al aire libre.',
    fechaEvento: '2026-07-20',
    horaEvento: { hour: 21, minute: 30, second: 0, nano: 0 },
    precioMinimo: 15,
    precioMaximo: 45,
    localidad: 'Barcelona',
    genero: 'Clásica',
    nombreRecinto: 'Parc del Fòrum',
    imagenUrl: 'https://example.com/evento.jpg',
  };

  let fixture: ComponentFixture<PurchaseComponent>;
  let buyTickets: ReturnType<typeof vi.fn>;

  it('carga y muestra los datos del evento indicado en la ruta', async () => {
    await createComponent(of(event));

    expect(TestBed.inject(EventService).findEventById).toHaveBeenCalledWith(7);
    expect(fixture.nativeElement.textContent).toContain(event.nombre);
    expect(fixture.nativeElement.textContent).toContain(event.nombreRecinto);
    expect(fixture.nativeElement.textContent).toContain('20 de julio de 2026');
  });

  it('no registra una compra con datos de pago inválidos', async () => {
    await createComponent(of(event));
    submitForm();

    expect(buyTickets).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Introduce el nombre del titular.');
  });

  it('normaliza los datos y registra una compra válida', async () => {
    await createComponent(of(event));
    setValidCard();
    submitForm();

    expect(buyTickets).toHaveBeenCalledWith(
      'julia@example.com',
      {
        cardholderName: 'Julia Adell',
        cardNumber: '4111111111111111',
        expiryMonth: '09',
        expiryYear: '2030',
        securityCode: '123',
        issuer: 'VISA',
      },
      {
        eventId: 7,
        eventName: 'Anochecer Sinfónico',
        eventDate: '2026-07-20',
        venueName: 'Parc del Fòrum',
        concept: '2 entrada(s) para Anochecer Sinfónico',
        ticketQuantity: 2,
        unitPrice: 15,
        totalAmount: 30,
      },
    );
    expect(fixture.nativeElement.textContent).toContain('Compra registrada correctamente.');
  });

  it('calcula el importe total según la cantidad seleccionada', async () => {
    await createComponent(of(event));
    const quantityInput = fixture.nativeElement.querySelector(
      '#ticketQuantity',
    ) as HTMLInputElement;
    quantityInput.value = '3';
    quantityInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const total = fixture.nativeElement.querySelector('[data-testid="purchase-total"]');
    expect(total.textContent).toContain('45,00');
  });

  it.each([0, -1])('no permite comprar una cantidad no válida: %s', async (quantity) => {
    await createComponent(of(event));
    setValidCard();
    fixture.componentInstance['form'].controls.ticketQuantity.setValue(quantity);
    submitForm();

    expect(buyTickets).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Introduce una cantidad de entradas mayor que cero.',
    );
  });

  it('no permite comprar con la cantidad de entradas vacía', async () => {
    await createComponent(of(event));
    setValidCard();
    const quantityInput = fixture.nativeElement.querySelector(
      '#ticketQuantity',
    ) as HTMLInputElement;
    quantityInput.value = '';
    quantityInput.dispatchEvent(new Event('input'));
    submitForm();

    expect(buyTickets).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Introduce una cantidad de entradas mayor que cero.',
    );
  });

  it('muestra el rechazo comunicado por la pasarela', async () => {
    await createComponent(of(event), of({ status: 'KO', message: ['Tarjeta rechazada.'] }));
    setValidCard();
    submitForm();

    expect(fixture.nativeElement.textContent).toContain('Tarjeta rechazada.');
  });

  it('mantiene el botón deshabilitado y evita compras duplicadas durante el proceso', async () => {
    const pendingPurchase = new Subject<RespuestaCompra>();
    await createComponent(of(event), pendingPurchase);
    setValidCard();
    submitForm();

    const submitButton = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    submitForm();
    expect(buyTickets).toHaveBeenCalledTimes(1);

    pendingPurchase.next({ status: 'OK', message: ['200.0001'] });
    pendingPurchase.complete();
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(false);
  });

  it('muestra un mensaje comprensible si no puede conectar con la pasarela', async () => {
    await createComponent(
      of(event),
      throwError(() => new HttpErrorResponse({ status: 0 })),
    );
    setValidCard();
    submitForm();

    expect(fixture.nativeElement.textContent).toContain(
      'No se ha podido conectar con la pasarela de pago.',
    );
  });

  it('no registra la compra si no existe un usuario autenticado', async () => {
    await createComponent(of(event), of({ status: 'OK' }), '7', null);
    setValidCard();
    submitForm();

    expect(buyTickets).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Debes acceder a tu cuenta antes de registrar una compra.',
    );
  });

  it('muestra un error si el evento no existe', async () => {
    await createComponent(throwError(() => new HttpErrorResponse({ status: 404 })));

    expect(fixture.nativeElement.textContent).toContain(
      'No hemos encontrado el evento solicitado.',
    );
  });

  it('rechaza un identificador de evento inválido sin consultar el servicio', async () => {
    await createComponent(of(event), of({ status: 'OK' }), 'abc');

    expect(TestBed.inject(EventService).findEventById).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'El identificador del evento no es válido.',
    );
  });

  async function createComponent(
    eventResponse: Observable<Evento>,
    purchaseResponse: Observable<RespuestaCompra> = of({ status: 'OK' }),
    routeId = '7',
    userEmail: string | null = 'julia@example.com',
  ): Promise<void> {
    TestBed.resetTestingModule();
    buyTickets = vi.fn().mockReturnValue(purchaseResponse);
    await TestBed.configureTestingModule({
      imports: [PurchaseComponent],
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'es-ES' },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ eventoId: routeId })) },
        },
        {
          provide: EventService,
          useValue: { findEventById: vi.fn().mockReturnValue(eventResponse) },
        },
        {
          provide: PurchaseService,
          useValue: {
            buyTickets,
            validatePurchase: (response: RespuestaCompra) => ({
              successful: response.status !== 'KO' && !response.error,
              message:
                response.message?.join(' ') || response.error || 'Compra registrada correctamente.',
            }),
          },
        },
        {
          provide: USER_SERVICE,
          useValue: {
            getCurrentUser: () =>
              of(
                userEmail === null
                  ? null
                  : {
                      id: 1,
                      nombre: 'Julia',
                      apellidos: 'Adell',
                      email: userEmail,
                      nombreUsuario: 'julia',
                    },
              ),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PurchaseComponent);
    fixture.detectChanges();
  }

  function setValidCard(): void {
    fixture.componentInstance['form'].setValue({
      nombreTitular: '  Julia Adell  ',
      numeroTarjeta: '4111 1111 1111 1111',
      mesCaducidad: '9',
      yearCaducidad: '2030',
      cvv: '123',
      emisor: 'VISA',
      ticketQuantity: 2,
    });
  }

  function submitForm(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }
});
