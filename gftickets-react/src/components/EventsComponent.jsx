export function EventComponent() {

    const [events, setEvents] = useState([]);

    return (
        <>
            {eventos.length === 0 && (
                <p data-testid="no-eventos">No hay eventos</p>
            )}
            {events.map(ev => {
                <article className="catalog-card" key={ev.id}>
                    <div className="catalog-card__media">
                        <img
                            src={ev.imagenUrl}
                            alt={ev.nombre}
                            className="catalog-card__img"
                        />
                        <span className="catalog-card__tag">{ev.genero}</span>
                    </div>

                    <div className="catalog-card__body">
                        <div className="catalog-card__meta">
                            <span>{ev.localidad}</span> • {ev.nombreRecinto}
                        </div>

                        <h3 className="catalog-card__title" title={ev.nombre}>
                            {ev.nombre}
                        </h3>

                        <div className="catalog-card__schedule">
                            <span>📅 {ev.fechaEvento}</span>
                            <span>🕒 {ev.horaEvento}h</span>
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
            })}
        </>
    );
}

