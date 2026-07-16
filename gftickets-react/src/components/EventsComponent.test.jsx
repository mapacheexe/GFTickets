import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventsComponent } from './EventsComponent';
import { findAllEvents } from '../services/EventsService';

vi.mock('../services/EventsService', () => ({
  findAllEvents: vi.fn(),
}));

// Mockear react-router-dom de forma global para este archivo de pruebas
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(), // Le da una función vacía simulada a tu componente
  };
});

const eventosMock = [
  {
    id: 1,
    nombre: 'Festival Indie Fest',
    genero: 'Indie',
    localidad: 'Valencia',
    nombreRecinto: 'Ciudad de las Artes',
    fechaEvento: '2026-07-20',
    horaEvento: '21:30:00',
    precioMinimo: 35,
    imagenUrl: 'https://example.com/img1.jpg',
  },
  {
    id: 2,
    nombre: 'Noche de Rock',
    genero: 'Rock',
    localidad: 'Madrid',
    nombreRecinto: 'WiZink Center',
    fechaEvento: '2026-09-05',
    horaEvento: '20:00:00',
    precioMinimo: 42,
    imagenUrl: 'https://example.com/img2.jpg',
  },
];

describe('EventsComponent', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('1. muestra los datos principales de cada evento cuando la carga es correcta', async () => {
    findAllEvents.mockResolvedValue(eventosMock);

    render(<EventsComponent />);

    const cards = await screen.findAllByRole('article');
    expect(cards).toHaveLength(eventosMock.length);

    eventosMock.forEach((evento, i) => {
      const card = within(cards[i]);
      expect(card.getByText(evento.nombre)).toBeInTheDocument();
      expect(card.getByText(evento.localidad)).toBeInTheDocument();
      expect(card.getByText(new RegExp(evento.nombreRecinto))).toBeInTheDocument();
      expect(card.getByText(evento.genero)).toBeInTheDocument();
      expect(card.getByText(`${evento.precioMinimo}€`)).toBeInTheDocument();
    });
  });

  test('2. muestra el mensaje de "no eventos" cuando la lista está vacía', async () => {
    findAllEvents.mockResolvedValue([]);

    render(<EventsComponent />);

    expect(await screen.findByTestId('no-eventos')).toBeInTheDocument();
  });

  test('3. muestra un mensaje de error si falla la carga de eventos', async () => {
    findAllEvents.mockRejectedValue(new Error('No se pudieron cargar los eventos'));

    render(<EventsComponent />);

    const error = await screen.findByTestId('error-eventos');
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent(/No se pudieron cargar los eventos/i);
  });

  test('4. renderiza correctamente un único evento sin errores', async () => {
    findAllEvents.mockResolvedValue([eventosMock[0]]);

    render(<EventsComponent />);

    const cards = await screen.findAllByRole('article');
    expect(cards).toHaveLength(1);
    expect(screen.getByText(eventosMock[0].nombre)).toBeInTheDocument();
    expect(screen.queryByTestId('no-eventos')).not.toBeInTheDocument();
  });

  test('5. formatea correctamente la fecha y la hora de un evento', async () => {
    findAllEvents.mockResolvedValue([eventosMock[0]]);

    render(<EventsComponent />);

    await screen.findAllByRole('article');

    const fecha = new Date(eventosMock[0].fechaEvento);
    const fechaEsperada = fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const horaEsperada = eventosMock[0].horaEvento.substring(0, 5);

    expect(screen.getByText(new RegExp(fechaEsperada))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${horaEsperada}h`))).toBeInTheDocument();
  });

  test('6. muestra entrada gratuita cuando el precio mínimo es 0', async () => {
    const eventoGratis = { ...eventosMock[0], precioMinimo: 0 };
    findAllEvents.mockResolvedValue([eventoGratis]);
    render(<EventsComponent />);
    expect(await screen.findByTestId('entrada-gratuita')).toBeInTheDocument();
  });

  test('7. muestra "Precios no disponibles" cuando el precio mínimo es negativo', async () => {
    const eventoSinPrecio = { ...eventosMock[0], precioMinimo: -1 };
    findAllEvents.mockResolvedValue([eventoSinPrecio]);
    render(<EventsComponent />);
    expect(await screen.findByTestId('precios-no-disponibles')).toBeInTheDocument();
  });
});