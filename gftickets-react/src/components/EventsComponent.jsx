import { useEffect, useState } from 'react';
import './EventsComponent.css';
import { findAllEvents } from '../services/EventsService';
import { useNavigate } from 'react-router-dom';
import { formatearFecha } from '../utils/dateUtils.js';
import { EventImage } from './EventImage.jsx';

export const EventsComponent = () => {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const cargarEventos = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await findAllEvents();
      setEventos(data);
    } catch (err) {
      setError('No se pudieron cargar los eventos.' + (err.message || ''));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  return (
    <main className="list-page">
      <header className="page-header">
        <p className="eyebrow">Eventos</p>
        <h1>Descubre próximos eventos</h1>
        <p className="subtitle">Encuentra conciertos y experiencias disponibles.</p>
      </header>

      {cargando ? (
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
          <button type="button" onClick={cargarEventos}>Reintentar</button>
        </section>
      ) : eventos.length === 0 ? (
        <section className="state-card">
          <span className="state-icon" aria-hidden="true">♪</span>
          <h2>No hay eventos disponibles</h2>
          <p data-testid="no-eventos">Actualmente no existen eventos.</p>
        </section>
      ) : (
        <section className="events-grid" aria-label="Listado de eventos">
          {eventos.map((evento) => (
            <article
              className="event-card"
              key={evento.id}
              onClick={() => navigate(`/eventos/${evento.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="event-image">
                <EventImage
                  src={evento.imagenUrl}
                  alt={evento.nombre}
                  className="event-img"
                  fallbackClassName="image-placeholder"
                />
                <span className="genre">{evento.genero}</span>
              </div>

              <div className="event-content">
                <h2 title={evento.nombre}>{evento.nombre}</h2>

                <div className="event-info">
                  <p>
                    <span aria-hidden="true">📅</span> {formatearFecha(evento.fechaEvento)}
                    {' · '}
                    <span aria-hidden="true">🕒</span> {evento.horaEvento.substring(0, 5)}h
                  </p>
                  <p>
                    <span aria-hidden="true">📍</span> {evento.localidad}
                    {evento.nombreRecinto ? ` · ${evento.nombreRecinto}` : ''}
                  </p>
                </div>

                <footer>
                  <strong>
                    {evento.precioMinimo < 0 ? (
                      <span data-testid="precios-no-disponibles">Precios no disponibles</span>
                    ) : evento.precioMinimo === 0 ? (
                      <span data-testid="entrada-gratuita">Entrada GRATUITA</span>
                    ) : (
                      <>Desde {evento.precioMinimo}€</>
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