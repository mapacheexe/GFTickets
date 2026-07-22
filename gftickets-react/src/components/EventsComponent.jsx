import { useEffect, useState, useMemo } from 'react';
import './EventsComponent.css';
import { findAllEvents } from '../services/EventsService';
import { useNavigate } from 'react-router-dom';
import { formatearFecha } from '../utils/dateUtils.js';
import { EventImage } from './EventImage.jsx';

const normalizar = (texto = '') =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes/diacríticos
    .toLowerCase()
    .trim();

const coincideConBusqueda = (nombreEvento, busqueda) => {
  const nombreNormalizado = normalizar(nombreEvento);
  const palabrasBusqueda = normalizar(busqueda).split(/\s+/).filter(Boolean);

  // cada palabra escrita debe aparecer en el nombre del evento, en cualquier orden
  return palabrasBusqueda.every((palabra) => nombreNormalizado.includes(palabra));
};

export const EventsComponent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await findAllEvents();
      setEvents(data);
    } catch (err) {
      setError('No se pudieron cargar los eventos.' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;
    return events.filter((ev) => coincideConBusqueda(ev.nombre, search));
  }, [events, search]);

  return (
    <main className="list-page">
      <header className="page-header">
        <p className="eyebrow">Eventos</p>
        <div className="search-bar">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento por nombre..."
            aria-label="Buscar evento por nombre"
            data-testid="buscador-eventos"
          />
        </div>
      </header>

      {loading ? (
        <section className="state-card" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true"></span>
          <h2>Cargando eventos</h2>
          <p data-testid="cargando-eventos">Estamos preparando la lista.</p>
        </section>
      ) : error ? (
        <section className="state-card" role="alert">
          <span className="state-icon" aria-hidden="true">!</span>
          <h2>Error al cargar eventos</h2>
          <p data-testid="error-eventos">{error}</p>
          <button type="button" onClick={loadEvents}>Reintentar</button>
        </section>
      ) : events.length === 0 ? (
        <section className="state-card">
          <span className="state-icon" aria-hidden="true">♪</span>
          <h2>No hay eventos disponibles</h2>
          <p data-testid="no-eventos">Actualmente no existen eventos.</p>
        </section>
      ) : filteredEvents.length === 0 ? (
        <section className="state-card">
          <span className="state-icon" aria-hidden="true">🔍</span>
          <h2>Sin resultados</h2>
          <p data-testid="sin-resultados-busqueda">
            No hemos encontrado ningún evento que coincida con &quot;{search}&quot;.
          </p>
        </section>
      ) : (
        <section className="events-grid" aria-label="Listado de eventos">
          {filteredEvents.map((ev) => (
            <article
              className="event-card"
              key={ev.id}
              onClick={() => navigate(`/eventos/${ev.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="event-image">
                <EventImage
                  src={ev.imagenUrl}
                  alt={ev.nombre}
                  className="event-img"
                  fallbackClassName="image-placeholder"
                />
                <span className="genre">{ev.genero}</span>
              </div>

              <div className="event-content">
                <h2 title={ev.nombre}>{ev.nombre}</h2>

                <div className="event-info">
                  <p>
                    <span aria-hidden="true">📅</span> {formatearFecha(ev.fechaEvento)}
                    {' · '}
                    <span aria-hidden="true">🕒</span> {ev.horaEvento.substring(0, 5)}h
                  </p>
                  <p>
                    <span aria-hidden="true">📍</span>
                    <span>{ev.localidad}</span>
                    {ev.nombreRecinto && <> · {ev.nombreRecinto}</>}
                  </p>
                </div>

                <footer>
                  <strong>
                    {ev.precioMinimo < 0 ? (
                      <span data-testid="precios-no-disponibles">Precios no disponibles</span>
                    ) : ev.precioMinimo === 0 ? (
                      <span data-testid="entrada-gratuita">Entrada GRATUITA</span>
                    ) : (
                      <>Desde <span>{ev.precioMinimo}€</span></>
                    )}
                  </strong>
                  <span className="card-link">Ver detalle</span>
                </footer>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};