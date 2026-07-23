import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { TicketDetail } from '../../models/ticket-detail.model';
import { PurchaseService } from '../../services/purchase.service';
import { USER_SERVICE } from '../../services/user.service';
import { TicketDetailComponent } from './ticket-detail';

registerLocaleData(localeEs);

describe('TicketDetailComponent', () => {
  const ticketDetail: TicketDetail = {
    transaction: {
      id: 'transaction-1',
      userEmail: 'julia@example.com',
      createdAt: '2026-07-17T10:00:00.000Z',
      invoice: {
        eventId: 7,
        eventName: 'Festival de verano',
        eventDate: '2026-07-20',
        venueName: 'Parc del Fòrum',
        concept: '2 entradas para Festival de verano',
        ticketQuantity: 2,
        unitPrice: 17.5,
        totalAmount: 35,
      },
    },
    event: {
      id: 7,
      nombre: 'Festival de verano',
      descripcion: 'Música al aire libre junto al mar.',
      fechaEvento: '2026-07-20',
      horaEvento: { hour: 9, minute: 5, second: 0, nano: 0 },
      precioMinimo: 17.5,
      precioMaximo: 35,
      localidad: 'Barcelona',
      genero: 'Música',
      nombreRecinto: 'Parc del Fòrum',
      imagenUrl: 'https://example.com/festival.jpg',
    },
  };

  let fixture: ComponentFixture<TicketDetailComponent>;
  let getTicketDetail: ReturnType<typeof vi.fn>;

  it('muestra la información del festival y de la entrada comprada', async () => {
    await createComponent(of(ticketDetail));

    const content = fixture.nativeElement.textContent;
    const links = fixture.nativeElement.querySelectorAll(
      'footer a',
    ) as NodeListOf<HTMLAnchorElement>;

    expect(getTicketDetail).toHaveBeenCalledWith('transaction-1', 'julia@example.com');
    expect(content).toContain('Festival de verano');
    expect(content).toContain('Música al aire libre junto al mar.');
    expect(content).toContain('Parc del Fòrum, Barcelona');
    expect(content).toContain('09:05');
    expect(content).toContain('20/07/2026');
    expect(content).toContain('transaction-1');
    expect(content).toContain('35,00');
    expect(links[0].getAttribute('href')).toBe('/eventos/7');
    expect(links[1].getAttribute('href')).toBe('/compras/transaction-1');
  });

  it('muestra un error 404 cuando la entrada no existe', async () => {
    await createComponent(of(null));

    expect(fixture.nativeElement.textContent).toContain('error 404');
  });

  it('no consulta el servicio si el identificador está vacío', async () => {
    await createComponent(of(ticketDetail), '   ');

    expect(getTicketDetail).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('error 404');
  });

  it('bloquea la vista cuando no existe un usuario autenticado', async () => {
    await createComponent(of(ticketDetail), 'transaction-1', null);

    expect(getTicketDetail).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Debes iniciar sesión para consultar esta entrada.',
    );
  });

  it('informa si no se pueden recuperar los datos de la entrada', async () => {
    await createComponent(throwError(() => new Error('network error')));

    expect(fixture.nativeElement.textContent).toContain(
      'No se han podido cargar los datos de la entrada.',
    );
  });

  async function createComponent(
    response: Observable<TicketDetail | null>,
    ticketId = 'transaction-1',
    userEmail: string | null = 'julia@example.com',
  ): Promise<void> {
    TestBed.resetTestingModule();
    getTicketDetail = vi.fn().mockReturnValue(response);

    await TestBed.configureTestingModule({
      imports: [TicketDetailComponent],
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'es-ES' },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ ticketId })) },
        },
        {
          provide: PurchaseService,
          useValue: { getTicketDetail },
        },
        {
          provide: USER_SERVICE,
          useValue: {
            getCurrentUser: () =>
              of(
                userEmail === null
                  ? null
                  : {
                      id: 'firebase-user-id',
                      displayName: 'Julia Adell',
                      email: userEmail,
                    },
              ),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketDetailComponent);
    fixture.detectChanges();
    fixture.detectChanges();
  }
});
