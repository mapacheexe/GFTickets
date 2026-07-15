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

  useEffect(() => {
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

    cargarEventos();
  }, []);

  if (cargando) {
    return (
      <div className="catalog-container">
        <header className="catalog-header">
          <h1 className="catalog-header__title">GFTickets Back Office</h1>
        </header>
        <div className="catalog-loading">
          <span className="catalog-spinner" aria-hidden="true"></span>
          <p data-testid="cargando-eventos" className="catalog-empty__text">
            Cargando eventos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-container">
        <header className="catalog-header">
          <h1 className="catalog-header__title">GFTickets Back Office</h1>
        </header>
        <div className="catalog-empty">
          <span className="catalog-empty__icon">⚠️</span>
          <h3 className="catalog-empty__title">Error al cargar eventos</h3>
          <p data-testid="error-eventos" className="catalog-empty__text">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-container">
      <header className="catalog-header">
        <h1 className="catalog-header__title">GFTickets Back Office</h1>
      </header>

      {eventos.length === 0 ? (
        <div className="catalog-empty">
          <span className="catalog-empty__icon">📅</span>
          <h3 className="catalog-empty__title">No se encontraron eventos</h3>
          <p data-testid="no-eventos" className="catalog-empty__text">
            En este momento no hay conciertos ni espectáculos disponibles en esta categoría.
          </p>
        </div>
      ) : (
        <div className="catalog-grid">
          {eventos.map((evento) => (
            <article
              className="catalog-card"
              key={evento.id}
              onClick={() => navigate(`/eventos/${evento.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="catalog-card__media">
                <EventImage src={evento.imagenUrl} alt={evento.nombre} />
                <span className="catalog-card__tag">{evento.genero}</span>
              </div>

              <div className="catalog-card__body">
                <div className="catalog-card__meta">
                  <span>{evento.localidad}</span> • {evento.nombreRecinto}
                </div>

                <h3 className="catalog-card__title" title={evento.nombre}>
                  {evento.nombre}
                </h3>

                <div className="catalog-card__schedule">
                  <span>📅 {formatearFecha(evento.fechaEvento)}</span>
                  <span>🕒 {evento.horaEvento.substring(0, 5)}h</span>
                </div>

                <div className="catalog-card__footer">
                  <div className="catalog-card__price">
                    <span className="catalog-card__price-label">Desde</span>
                    <span className="catalog-card__price-val">{evento.precioMinimo}€</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};