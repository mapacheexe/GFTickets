import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EventCardComponent } from './event-card';
import { Evento } from '../../models/evento.model';

describe('EventCardComponent', () => {
  let fixture: ComponentFixture<EventCardComponent>;
  let component: EventCardComponent;

  const evento: Evento = {
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

    fixture.componentRef.setInput('evento', evento);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display event information', () => {
    const { textContent } = fixture.nativeElement;

    expect(textContent).toContain('Anochecer Sinfónico');
    expect(textContent).toContain('Clásica');
    expect(textContent).toContain('Barcelona');
  });

  it('should show minimum price', () => {
    expect(fixture.nativeElement.textContent).toContain('15');
  });

  it('should show placeholder when image url is missing', () => {
    fixture.componentRef.setInput('evento', {
      ...evento,
      imagenUrl: '',
    });

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent,
    ).toContain('Imagen no disponible');
  });


  it('should show placeholder when image loading fails', () => {
    fixture.detectChanges();

    const image =
      fixture.nativeElement.querySelector('img') as HTMLImageElement;

    image.dispatchEvent(new Event('error'));

    fixture.detectChanges();

    expect(
      fixture.nativeElement.textContent,
    ).toContain('Imagen no disponible');
  });
});