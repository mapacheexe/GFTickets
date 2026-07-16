import { useParams, useNavigate } from "react-router-dom";
import { findEventById } from "../services/EventsService";
import { useEffect, useState } from "react";
import { formatearFecha } from "./../utils/dateUtils.js";
import { EventImage } from "./EventImage";
import './EventDetailsComponent.css';

export function EventDetailsComponent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            setCargando(true);
            setError(null);
            try {
                const data = await findEventById(id);
                setEvent(data);
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('No se pudo cargar la información del evento');
            } finally {
                setCargando(false);
            }
        };

        if (id) {
            fetchEvent();
        }
    }, [id]);

    if (cargando) {
        return (
            <div className="details-container">
                <header className="details-page-header">
                    <button
                        type="button"
                        className="details-back-btn"
                        onClick={() => navigate('/')}
                    >
                        ← Volver al catálogo
                    </button>
                </header>
                <div className="details-loading" data-testid="cargando-detalle">
                    <span className="details-spinner" aria-hidden="true"></span>
                    <p>Cargando detalle...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="details-container">
                <header className="details-page-header">
                    <button
                        type="button"
                        className="details-back-btn"
                        onClick={() => navigate('/')}
                    >
                        ← Volver al catálogo
                    </button>
                </header>
                <div data-testid="error-detalle" className="error-container">
                    <span role="img" aria-label="warning" style={{ fontSize: '2rem' }}>⚠️</span>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="details-container">
            <header className="details-page-header">
                <button
                    type="button"
                    className="details-back-btn"
                    onClick={() => navigate('/')}
                >
                    ← Volver al catálogo
                </button>
                {event && <h2 className="details-page-title">{event.nombre}</h2>}
            </header>

            {event && (
                <article className="details-layout">
                    {/* Columna Izquierda */}
                    <div className="details-media">
                        <EventImage
                            src={event.imagenUrl}
                            alt={event.nombre}
                            className="details-img"
                            fallbackClassName="details-img-fallback"
                        />
                    </div>

                    {/* Columna Derecha */}
                    <div className="details-info">
                        <div className="details-header">
                            <h1 className="details-title">{event.nombre}</h1>

                            <div className="details-meta-grid">
                                <div className="details-meta-item">
                                    <span className="details-meta-label">Ubicación</span>
                                    <span className="details-meta-val">
                                        {event.localidad}
                                        {event.nombreRecinto ? ` · ${event.nombreRecinto}` : ''}
                                    </span>
                                </div>
                                <div className="details-meta-item">
                                    <span className="details-meta-label">Fecha</span>
                                    <span className="details-meta-val">{formatearFecha(event.fechaEvento)}</span>
                                </div>
                                <div className="details-meta-item">
                                    <span className="details-meta-label">Hora</span>
                                    <span className="details-meta-val">
                                        {event.horaEvento ? `${event.horaEvento.substring(0, 5)}h` : 'Por confirmar'}
                                    </span>
                                </div>
                            </div>

                            <div className="details-desc">
                                <h3 className="details-desc-title">Sobre el evento</h3>
                                <p className="details-desc-text">{event.descripcion}</p>
                            </div>
                        </div>

                        {/* Footer del detalle */}
                        <div className="details-footer">
                            <div className="details-price">
                                {event.precioMinimo < 0 ? (
                                    <span className="details-price-val" data-testid="precios-no-disponibles">
                                        Precios no disponibles
                                    </span>
                                ) : event.precioMinimo === 0 ? (
                                    <div className="details-price-range-container" data-testid="entrada-gratuita">
                                        {event.precioMaximo === 0 ? (
                                            <span className="details-price-val">
                                                Entrada gratuita
                                            </span>
                                        ) : (
                                            <span className="details-price-val">
                                                Sillas básicas sin coste <span className="details-price-separator">•</span> VIP hasta <strong>{event.precioMaximo}€</strong>
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <span className="details-price-label">Rango de Precios</span>
                                        <span className="details-price-val">
                                            {event.precioMinimo}€ - {event.precioMaximo}€
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </article>
            )}
        </div>
    );
}