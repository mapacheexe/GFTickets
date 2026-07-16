import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { RespuestaCompra } from '../../models/compra-entrada.model';
import { Evento } from '../../models/evento.model';
import { EventService } from '../../services/event.service';
import { PurchaseService } from '../../services/purchase.service';
import { PurchaseComponent } from './purchase';

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
  let createPurchase: ReturnType<typeof vi.fn>;

  it('carga y muestra el evento indicado en la ruta', async () => {
    await createComponent(of(event));

    expect(TestBed.inject(EventService).findEventById).toHaveBeenCalledWith(7);
    expect(fixture.nativeElement.textContent).toContain(event.nombre);
    expect(fixture.nativeElement.textContent).toContain(event.nombreRecinto);
  });

  it('no registra una compra con datos de pago inválidos', async () => {
    await createComponent(of(event));
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(createPurchase).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Introduce el nombre del titular.');
  });

  it('normaliza los datos y registra una compra válida', async () => {
    await createComponent(of(event));
    setValidCard();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(createPurchase).toHaveBeenCalledWith({
      nombreTitular: 'Julia Adell',
      numeroTarjeta: '4111111111111111',
      mesCaducidad: '09',
      yearCaducidad: '2030',
      cvv: '123',
      emisor: 'VISA',
      concepto: 'Entrada para Anochecer Sinfónico',
      cantidad: '15.00',
    });
    expect(fixture.nativeElement.textContent).toContain('Compra registrada correctamente.');
  });

  it('muestra el rechazo comunicado por la pasarela', async () => {
    await createComponent(of(event), of({ status: 'KO', message: ['Tarjeta rechazada.'] }));
    setValidCard();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tarjeta rechazada.');
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
  ): Promise<void> {
    TestBed.resetTestingModule();
    createPurchase = vi.fn().mockReturnValue(purchaseResponse);
    await TestBed.configureTestingModule({
      imports: [PurchaseComponent],
      providers: [
        provideRouter([]),
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
          useValue: { createPurchase },
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
    });
  }
});
