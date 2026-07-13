import React from 'react';

export const EventsComponent = ({ eventos = [] }) => {
  
  // Función auxiliar para dar formato breve a la fecha (ej: 20 Jul 2026)
  const formatearFecha = (fechaStr) => {
    return new Date(fechaStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="catalog-container">
      {eventos.length === 0 ? (
        <div className="catalog-empty">
          <span className="catalog-empty__icon">📅</span>
          <h3 className="catalog-empty__title">No se encontraron eventos</h3>
          <p className="catalog-empty__text">
            Lo sentimos, en este momento no hay conciertos ni espectáculos disponibles en esta categoría.
          </p>
        </div>
      ) : (
        <div className="catalog-grid">
          {eventos.map((evento) => (
            <article className="catalog-card" key={evento.id}>
              <div className="catalog-card__media">
                <img 
                  src={evento.imagenUrl} 
                  alt={evento.nombre} 
                  className="catalog-card__img" 
                />
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
                  <button className="catalog-card__btn" type="button">
                    Tickets
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

