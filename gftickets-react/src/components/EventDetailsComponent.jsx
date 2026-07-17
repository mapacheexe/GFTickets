import { useParams, useNavigate, Link } from "react-router-dom";
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
    const [leerMas, setLeerMas] = useState(false);

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

    useEffect(() => {
        if (id) {
            fetchEvent();
        }
    }, [id]);

    const renderDescripcion = () => {
        const descripcion = event?.descripcion || "";

        if (descripcion.length <= import.meta.env.VITE_LIMITE_CARACTERES) {
            return <p className="description">{descripcion}</p>;
        }

        const textoMostrado = leerMas
            ? descripcion
            : `${descripcion.substring(0, import.meta.env.VITE_LIMITE_CARACTERES)}... `;

        return (
            <p className="description">
                {textoMostrado}
                <button
                    type="button"
                    className="read-more-btn"
                    data-testid="toggle-descripcion-btn"
                    onClick={() => setLeerMas(!leerMas)}
                >
                    {leerMas ? "Ver menos" : "Ver más"}
                </button>
            </p>
        );
    };

    return (
        <main className="detail-page">
            <button
                type="button"
                className="back-link"
                onClick={() => navigate('/')}
            >
                <span aria-hidden="true">←</span> Volver al catálogo
            </button>

            {cargando ? (
                <section className="state-card loading" data-testid="cargando-detalle" role="status" aria-live="polite">
                    <span className="spinner" aria-hidden="true"></span>
                    <h1>Cargando evento</h1>
                    <p>Estamos preparando todos los detalles.</p>
                </section>
            ) : error ? (
                <section className="state-card error" data-testid="error-detalle" role="alert">
                    <span className="state-icon" aria-hidden="true">!</span>
                    <h1>No se pudo mostrar el evento</h1>
                    <p>{error}</p>
                    <div className="state-actions">
                        <button type="button" onClick={fetchEvent}>Reintentar</button>
                        <Link to="/">Ver todos los eventos</Link>
                    </div>
                </section>
            ) : event && (
                <article className="event-detail-card">
                    <div className="event-image">
                        <EventImage
                            src={event.imagenUrl}
                            alt={event.nombre}
                            className="event-img"
                            fallbackClassName="image-placeholder"
                        />
                        <span className="genre">{event.genero}</span>
                    </div>

                    <div className="event-content">
                        <p className="eyebrow">Evento destacado</p>
                        <h1>{event.nombre}</h1>
                        {renderDescripcion()}

                        <dl className="event-data">
                            <div>
                                <dt>Fecha</dt>
                                <dd>{formatearFecha(event.fechaEvento)}</dd>
                            </div>
                            <div>
                                <dt>Hora</dt>
                                <dd>{event.horaEvento ? `${event.horaEvento.substring(0, 5)}h` : 'Por confirmar'}</dd>
                            </div>
                            <div>
                                <dt>Recinto</dt>
                                <dd>{event.nombreRecinto}</dd>
                            </div>
                            <div>
                                <dt>Localidad</dt>
                                <dd>{event.localidad}</dd>
                            </div>
                        </dl>

                        <div className="price-panel">
                            <div>
                                <span className="price-label">Precio de las entradas</span>
                                {event.precioMinimo < 0 ? (
                                    <strong data-testid="precios-no-disponibles">Precios no disponibles</strong>
                                ) : event.precioMinimo === 0 ? (
                                    event.precioMaximo === 0 ? (
                                        <strong data-testid="entrada-gratuita">Entrada gratuita</strong>
                                    ) : (
                                        <strong data-testid="entrada-gratuita">
                                            Sillas básicas sin coste <span className="price-separator">•</span> VIP hasta {event.precioMaximo}€
                                        </strong>
                                    )
                                ) : (
                                    <strong>{event.precioMinimo}€ – {event.precioMaximo}€</strong>
                                )}
                            </div>
                            <span className="availability">Disponible</span>
                        </div>
                    </div>
                </article>
            )}
        </main>
    );
}