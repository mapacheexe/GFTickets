import { describe, test, expect, vi, afterEach } from 'vitest';
import { findAllEvents } from '../services/EventsService';

describe('findAllEvents', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('1. llama a fetch con la URL correcta', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await findAllEvents();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos'
    );
  });

  test('2. devuelve los eventos parseados cuando la respuesta es correcta', async () => {
    const eventosMock = [
      { id: 1, nombre: 'Festival Indie Fest' },
      { id: 2, nombre: 'Noche de Rock' },
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => eventosMock,
    });

    const resultado = await findAllEvents();

    expect(resultado).toEqual(eventosMock);
  });

  test('3. devuelve una lista vacía cuando la API no tiene eventos', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const resultado = await findAllEvents();

    expect(resultado).toEqual([]);
  });

  test('4. lanza un error cuando la respuesta HTTP no es ok (p.ej. 500)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    await expect(findAllEvents()).rejects.toThrow('No se pudieron cargar los eventos');
  });

  test('5. propaga el error si la petición fetch falla (sin conexión)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    await expect(findAllEvents()).rejects.toThrow('Network error');
  });
});