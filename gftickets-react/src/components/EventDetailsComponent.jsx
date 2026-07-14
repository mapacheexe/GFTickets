import { useParams } from "react-router-dom";
import { findEventById } from "../services/EventsService";
import { useEffect, useState } from "react";
import { formatearFecha } from "./../utils/dateUtils.js";

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
        return <p data-testid="cargando-detalle">Cargando detalle...</p>;
    }

    if (error) {
        return (
            <div data-testid="error-detalle" className="error-container">
                <p>{error}</p>
                <span role="img" aria-label="warning">⚠️</span>
            </div>
        );
    }

    return (
        <>
            {event && (
                <div className="event-details">
                    <h1>{event.nombre}</h1>
                    <img src={event.imagenUrl} alt={event.nombre} />
                    <p>{event.descripcion}</p>
                    <p>Localidad: {event.localidad}</p>
                    <p>Fecha: {formatearFecha(event.fechaEvento)}</p>
                    <p>Hora: {event.horaEvento ? `${event.horaEvento.substring(0, 5)}h` : ''}</p>
                    <p>Precio: {event.precioMinimo}€ - {event.precioMaximo}€</p>
                </div>
            )}
        </>
    );
}