import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EventListComponent } from './event-list';

describe('EventListComponent', () => {
  let fixture: ComponentFixture<EventListComponent>;
  let httpTesting: HttpTestingController;

  const apiUrl = 'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventListComponent);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debería cargar eventos', () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne(apiUrl);

    expect(request.request.method).toBe('GET');

    request.flush([
      {
        id: 1,
        nombre: 'Concierto',
        descripcion: 'Evento',
        fechaEvento: '2026-07-20',
        horaEvento: {
          hour: 21,
          minute: 30,
          second: 0,
          nano: 0,
        },
        precioMinimo: 20,
        precioMaximo: 40,
        localidad: 'Barcelona',
        genero: 'Música',
        nombreRecinto: 'Palau',
        imagenUrl: 'image.jpg',
      },
    ]);

    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-event-card');

    expect(cards.length).toBe(1);
  });

  it('debería mostrar error cuando falla la carga', () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne(apiUrl);

    request.flush(
      {},
      {
        status: 500,
        statusText: 'Server error',
      },
    );

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain('Error al cargar eventos');
  });

  it('debería mostrar estado vacío cuando no hay eventos disponibles', () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne(apiUrl);

    expect(request.request.method).toBe('GET');

    request.flush([]);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain('No hay eventos disponibles');
  });


  it('debería renderizar todos los eventos recibidos sin duplicados', () => {
    fixture.detectChanges();

    const request = httpTesting.expectOne(apiUrl);

    request.flush([
      {
        id: 1,
        nombre: 'Concierto A',
        descripcion: 'Evento A',
        fechaEvento: '2026-07-20',
        horaEvento: {
          hour: 21,
          minute: 30,
          second: 0,
          nano: 0,
        },
        precioMinimo: 20,
        precioMaximo: 40,
        localidad: 'Barcelona',
        genero: 'Música',
        nombreRecinto: 'Palau',
        imagenUrl: 'image-a.jpg',
      },
      {
        id: 2,
        nombre: 'Concierto B',
        descripcion: 'Evento B',
        fechaEvento: '2026-08-15',
        horaEvento: {
          hour: 20,
          minute: 0,
          second: 0,
          nano: 0,
        },
        precioMinimo: 30,
        precioMaximo: 60,
        localidad: 'Madrid',
        genero: 'Rock',
        nombreRecinto: 'Wizink',
        imagenUrl: 'image-b.jpg',
      },
    ]);

    fixture.detectChanges();

    const cards =
      fixture.nativeElement.querySelectorAll('app-event-card');

    expect(cards.length).toBe(2);

    const content =
      fixture.nativeElement.textContent;

    expect(content).toContain('Concierto A');
    expect(content).toContain('Concierto B');
  });
});