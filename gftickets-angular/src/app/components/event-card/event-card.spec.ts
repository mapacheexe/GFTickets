import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EventCardComponent } from './event-card';
import { Evento } from '../../models/evento.model';

describe('EventCardComponent', () => {
  let fixture: ComponentFixture<EventCardComponent>;
  let component: EventCardComponent;

  const event: Evento = {
    id: 7,
    nombre: 'Anochecer Sinfónico',
    descripcion: 'Concierto al aire libre.',
    fechaEvento: '2026-07-20',
    horaEvento: {
      hour: 21,
      minute: 30,
      second: 0,
      nano: 0,
    },
    precioMinimo: 15,
    precioMaximo: 45,
    localidad: 'Barcelona',
    genero: 'Clásica',
    nombreRecinto: 'Parc del Fòrum',
    imagenUrl: 'https://example.com/evento.jpg',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCardComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('event', event);
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar la información del evento', () => {
    const { textContent } = fixture.nativeElement;

    expect(textContent).toContain('Anochecer Sinfónico');
    expect(textContent).toContain('Clásica');
    expect(textContent).toContain('Barcelona');
  });

  it('debería mostrar el precio mínimo', () => {
    expect(fixture.nativeElement.textContent).toContain('15');
  });

  it('debería mostrar el marcador de posición cuando no hay URL de imagen', () => {
    fixture.componentRef.setInput('event', {
      ...event,
      imagenUrl: '',
    });

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent,
    ).toContain('Imagen no disponible');
  });

  it('debería mostrar el marcador de posición cuando falla la carga de la imagen', () => {
    fixture.detectChanges();

    const image =
      fixture.nativeElement.querySelector('img') as HTMLImageElement;

    image.dispatchEvent(new Event('error'));

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent,
    ).toContain('Imagen no disponible');
  });

  it('debería mostrar "Precio no disponible" cuando el precio mínimo es negativo', () => {
    fixture.componentRef.setInput('event', {
      ...event,
      precioMinimo: -1,
    });

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent,
    ).toContain('Precio no disponible');
  });
});