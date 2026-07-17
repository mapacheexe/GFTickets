import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {createEvent, findAllEvents, findEventById } from '../services/EventsService';

describe('EventsService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findAllEvents', () => {
    test('1. llama a fetch con la URL correcta', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await findAllEvents();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos'
      );
    });

    test('2. devuelve los eventos parseados cuando la respuesta es correcta', async () => {
      const eventosMock = [
        { id: 1, nombre: 'Festival Indie Fest' },
        { id: 2, nombre: 'Noche de Rock' },
      ];
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => eventosMock,
      });

      const resultado = await findAllEvents();

      expect(resultado).toEqual(eventosMock);
    });

    test('3. devuelve una lista vacía cuando la API no tiene eventos', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const resultado = await findAllEvents();

      expect(resultado).toEqual([]);
    });

    test('4. lanza un error cuando la respuesta HTTP no es ok (p.ej. 500)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      });

      await expect(findAllEvents()).rejects.toThrow('No se pudieron cargar los eventos');
    });

    test('5. propaga el error si la petición fetch falla (sin conexión)', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      await expect(findAllEvents()).rejects.toThrow('Network error');
    });
  });

  describe('findEventById', () => {
    test('1. llama a fetch con la URL correcta concatenando el ID', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await findEventById('42');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos/42'
      );
    });

    test('2. devuelve los datos del evento cuando la respuesta es correcta', async () => {
      const mockEvento = { id: 42, nombre: 'Concierto de Rock' };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockEvento,
      });

      const resultado = await findEventById('42');

      expect(resultado).toEqual(mockEvento);
    });

    test('3. lanza el error exacto cuando la respuesta HTTP no es ok (p.ej. 404)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(findEventById('999')).rejects.toThrow('No se pudo cargar el evento');
    });

    test('4. lanza el error exacto cuando el servidor responde con 500', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(findEventById('42')).rejects.toThrow('No se pudo cargar el evento');
    });

    test('5. maneja la petición de forma consistente si el ID es nulo o indefinido', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(findEventById(null)).rejects.toThrow('No se pudo cargar el evento');
    });
  });

  describe('createEvent()', () => {
    const mockApiUrl = 'https://api.miseventos.com/v1/events';
    const mockEventData = { title: 'Concierto de Rock', date: '2026-08-15' };

    beforeEach(() => {
      import.meta.env.VITE_API_URL = mockApiUrl;
      vi.restoreAllMocks();
    });

    test('1. debería retornar el JSON del servidor si la respuesta es correcta (ok: true)', async () => {
      const mockResponse = { id: '123', ...mockEventData };

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createEvent(mockEventData);

      expect(result).toEqual(mockResponse);
    });

    test('2. debería lanzar un error específico si el servidor responde con un estado incorrecto (ok: false)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(createEvent(mockEventData)).rejects.toThrow('No se pudo crear el evento');
    });

    test('3. debería usar correctamente el método post, los headers y el body en la petición', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await createEvent(mockEventData);

      expect(fetchSpy).toHaveBeenCalledWith(mockApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockEventData),
      });
    });

    test('4. debería lanzar un SyntaxError si el servidor responde ok pero el cuerpo no es un JSON válido', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => { 
        throw new SyntaxError('Unexpected token < in JSON at position 0'); 
      },
    });

    await expect(createEvent(mockEventData)).rejects.toThrow(SyntaxError);
  });

    test('5. debería propagar el error nativo si la petición fetch falla por completo (ej. sin internet)', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network Error'));

      await expect(createEvent(mockEventData)).rejects.toThrow('Network Error');
    });
  });
});