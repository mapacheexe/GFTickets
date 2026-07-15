import { useParams } from "react-router-dom";
import { findEventById } from "../services/EventsService";
import { useEffect, useState } from "react";
import { formatearFecha } from "./../utils/dateUtils.js";
import './EventDetailsComponent.css'; 

export function EventDetailsComponent() {
    const { id } = useParams();
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
        return <div className="details-loading" data-testid="cargando-detalle">Cargando detalle...</div>;
    }

    if (error) {
        return (
            <div data-testid="error-detalle" className="error-container">
                <span role="img" aria-label="warning" style={{ fontSize: '2rem' }}>⚠️</span>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="details-container">
            {event && (
                <article className="details-layout">
                    {/* Columna Izquierda: Imagen limpia sin etiquetas flotantes */}
                    <div className="details-media">
                        <img className="details-img" src={event.imagenUrl} alt={event.nombre} />
                    </div>

                    {/* Columna Derecha: Información */}
                    <div className="details-info">
                        <div className="details-header">
                            <h1 className="details-title">{event.nombre}</h1>
                            
                            {/* Cuadrícula de metadatos actualizada con la Localidad integrada */}
                            <div className="details-meta-grid">
                                <div className="details-meta-item">
                                    <span className="details-meta-label">Localidad</span>
                                    <span className="details-meta-val">{event.localidad}</span>
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

                        {/* Footer solo con el rango de precios */}
                        <div className="details-footer">
                            <div className="details-price">
                                <span className="details-price-label">Rango de Precios</span>
                                <span className="details-price-val">
                                    {event.precioMinimo}€ - {event.precioMaximo}€
                                </span>
                            </div>
                        </div>
                    </div>
                </article>
            )}
        </div>
    );
}