import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Evento } from '../models/evento.model';
import { EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;
  let httpTesting: HttpTestingController;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(EventService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('debe obtener un evento por su id y normalizar la hora', () => {
    service.findEventById(7).subscribe((resultado) => {
      expect(resultado).toEqual(evento);
    });

    const request = httpTesting.expectOne(
      'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos/7',
    );

    expect(request.request.method).toBe('GET');

    request.flush({
      ...evento,
      horaEvento: '21:30:00',
    });
  });

  it('debe propagar el error cuando el evento no existe', () => {
    service.findEventById(99).subscribe({
      next: () => fail('debería haber fallado la petición'),
      error: (error) => {
        expect(error.status).toBe(404);
      },
    });

    const request = httpTesting.expectOne(
      'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos/99',
    );

    expect(request.request.method).toBe('GET');

    request.flush('Evento no encontrado', {
      status: 404,
      statusText: 'Not Found',
    });
  });
});