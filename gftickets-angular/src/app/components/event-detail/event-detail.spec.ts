import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { Evento } from '../../models/evento.model';
import { EventService } from '../../services/event.service';
import { EventDetail } from './event-detail';

describe('EventDetail', () => {
  let fixture: ComponentFixture<EventDetail>;
  let getEventoById: ReturnType<typeof vi.fn>;

  const evento: Evento = {
    id: 7,
    nombre: 'Anochecer Sinfónico',
    descripcion: 'Concierto al aire libre.',
    fechaEvento: '2026-07-20',
    horaEvento: '21:30:00',
    precioMinimo: 15,
    precioMaximo: 45,
    localidad: 'Barcelona',
    genero: 'Clásica',
    nombreRecinto: 'Parc del Fòrum',
    imagenUrl: 'https://example.com/evento.jpg',
  };

  async function configurarTest(respuesta: Observable<Evento>): Promise<void> {
    getEventoById = vi.fn().mockReturnValue(respuesta);

    await TestBed.configureTestingModule({
      imports: [EventDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '7' })) },
        },
        {
          provide: EventService,
          useValue: { getEventoById },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventDetail);
  }

  it('debe solicitar y mostrar el evento indicado en la ruta', async () => {
    await configurarTest(of(evento));
    fixture.detectChanges();

    expect(getEventoById).toHaveBeenCalledWith(7);
    expect(fixture.nativeElement.textContent).toContain('Anochecer Sinfónico');
    expect(fixture.nativeElement.textContent).toContain('Parc del Fòrum');
  });

  it('debe mostrar un mensaje cuando el evento no existe', async () => {
    const respuesta = throwError(() => new HttpErrorResponse({ status: 404 }));
    await configurarTest(respuesta);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'No hemos encontrado el evento solicitado.',
    );
  });
});
