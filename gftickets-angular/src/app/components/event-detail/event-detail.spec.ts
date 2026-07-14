import { HttpErrorResponse } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Component, LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { Evento } from '../../models/evento.model';
import { EventService } from '../../services/event.service';
import { EventDetailComponent } from './event-detail';

registerLocaleData(localeEs);

@Component({ template: '' })
class EventListStubComponent {}

describe('EventDetailComponent', () => {
  let fixture: ComponentFixture<EventDetailComponent>;
  let findEventById: ReturnType<typeof vi.fn>;

  const evento: Evento = {
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

  async function configurarTest(respuesta: Observable<Evento | null>): Promise<void> {
    findEventById = vi.fn().mockReturnValue(respuesta);

    await TestBed.configureTestingModule({
      imports: [EventDetailComponent],
      providers: [
        provideRouter([{ path: 'eventos', component: EventListStubComponent }]),
        { provide: LOCALE_ID, useValue: 'es-ES' },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '7' })) },
        },
        {
          provide: EventService,
          useValue: { findEventById },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventDetailComponent);
  }

  it('debe solicitar y mostrar un evento válido', async () => {
    await configurarTest(of(evento));
    fixture.detectChanges();

    expect(findEventById).toHaveBeenCalledWith(7);
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Anochecer Sinfónico');
  });

  it('debe visualizar los campos principales del evento', async () => {
    await configurarTest(of(evento));
    fixture.detectChanges();

    const contenido = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(contenido).toContain(evento.descripcion);
    expect(contenido).toContain(evento.genero);
    expect(contenido).toContain(evento.localidad);
    expect(contenido).toContain(evento.nombreRecinto);
    expect(contenido).toContain('21:30');
    expect(contenido).toContain('15,00');
    expect(contenido).toContain('45,00');
  });

  it('debe mostrar un mensaje cuando el identificador no existe', async () => {
    const respuesta = throwError(() => new HttpErrorResponse({ status: 404 }));
    await configurarTest(respuesta);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'No hemos encontrado el evento solicitado.',
    );
  });

  it('debe mostrar un mensaje cuando el servicio devuelve null', async () => {
    await configurarTest(of(null));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudo cargar el evento.');
  });

  it('debe mostrar un mensaje cuando el servicio falla', async () => {
    const respuesta = throwError(() => new HttpErrorResponse({ status: 500 }));
    await configurarTest(respuesta);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'No se ha podido cargar el evento. Inténtalo de nuevo.',
    );
  });

  it('debe volver al listado de eventos', async () => {
    await configurarTest(of(evento));
    fixture.detectChanges();

    const volver = fixture.nativeElement.querySelector('.back-link') as HTMLAnchorElement;
    volver.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/eventos');
  });
});
