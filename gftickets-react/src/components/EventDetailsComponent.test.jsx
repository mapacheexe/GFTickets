import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { EventDetailsComponent } from './EventDetailsComponent';
import { findEventById } from '../services/EventsService';

vi.mock('../services/EventsService', () => ({
  findEventById: vi.fn(),
}));

const mockParams = { id: '42' };
vi.mock('react-router-dom', () => ({
  useParams: () => mockParams,
  useNavigate: () => vi.fn(),
}));

describe('EventDetailsComponent', () => {
  const mockEvento = {
    id: '42',
    nombre: 'Concierto de Rock Pro',
    imagenUrl: 'http://imagen.com/rock.jpg',
    descripcion: 'Una noche inolvidable con la mejor música en directo.',
    localidad: 'Valencia',
    fechaEvento: '2026-08-15',
    horaEvento: '21:00:00',
    precioMinimo: 25,
    precioMaximo: 80,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockParams.id = '42'; // Reseteamos el ID por defecto antes de cada test
  });

  test('1. Renderizado del estado de carga (Loading)', async () => {
    vi.mocked(findEventById).mockReturnValue(new Promise(() => {}));

    render(<EventDetailsComponent />);

    const loadingElement = screen.getByTestId('cargando-detalle');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveTextContent('Cargando detalle...');
  });

  test('2. Renderizado exitoso de los datos del evento', async () => {
    vi.mocked(findEventById).mockResolvedValue(mockEvento);

    render(<EventDetailsComponent />);

    await waitFor(() => {
      expect(screen.queryByTestId('cargando-detalle')).not.toBeInTheDocument();
    });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Concierto de Rock Pro');

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'http://imagen.com/rock.jpg');
    expect(img).toHaveAttribute('alt', 'Concierto de Rock Pro');

    expect(screen.getByText('Una noche inolvidable con la mejor música en directo.')).toBeInTheDocument();
  });

  test('3. Captura del ID desde los parámetros de la URL', async () => {
    mockParams.id = '999';
    vi.mocked(findEventById).mockResolvedValue(mockEvento);

    render(<EventDetailsComponent />);

    await waitFor(() => {
      expect(findEventById).toHaveBeenCalledWith('999');
    });
  });

  test('4. Manejo y visualización de errores en pantalla', async () => {
    vi.mocked(findEventById).mockRejectedValue(new Error('API Error'));

    render(<EventDetailsComponent />);

    const errorBlock = await screen.findByTestId('error-detalle');
    expect(errorBlock).toBeInTheDocument();
    expect(errorBlock).toHaveTextContent('No se pudo cargar la información del evento');

    expect(screen.getByRole('img', { name: 'warning' })).toBeInTheDocument();
  });

  test('5. Formateo correcto de fechas y horas', async () => {
    vi.mocked(findEventById).mockResolvedValue(mockEvento);

    render(<EventDetailsComponent />);

    await waitFor(() => {
      expect(screen.queryByTestId('cargando-detalle')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/15 ago 2026/)).toBeInTheDocument();

    expect(screen.getByText(/21:00h/i)).toBeInTheDocument();
  });

  test('6. Si el precio mínimo es 0, se muestra "Gratis"', async () => {
    const eventoGratis = { ...mockEvento, precioMinimo: 0 };
    vi.mocked(findEventById).mockResolvedValue(eventoGratis);

    render(<EventDetailsComponent />);
    expect(await screen.findByTestId('entrada-gratuita')).toBeInTheDocument();
  });

  test('7. Si el precio mínimo es negativo, se muestra "Precios no disponibles"', async () => {
    const eventoSinPrecio = { ...mockEvento, precioMinimo: -1 };
    vi.mocked(findEventById).mockResolvedValue(eventoSinPrecio);

    render(<EventDetailsComponent />);
    expect(await screen.findByTestId('precios-no-disponibles')).toBeInTheDocument();
  });
});