import { useEffect, useState } from 'react';
import './EventsComponent.css';
import { findAllEvents } from '../services/EventsService';
import { useNavigate } from 'react-router-dom';
import { formatearFecha } from '../utils/dateUtils.js';
import { EventImage } from './EventImage.jsx';

export const EventsComponent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  return (
    <main className="list-page">
      <header className="page-header">
        <p className="eyebrow">Eventos</p>
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
      ) : (
        <section className="events-grid" aria-label="Listado de eventos">
          {events.map((ev) => (
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