import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createEvent, updateEvent, findEventById } from "../services/EventsService";
import './EventFormComponent.css';

export function EventFormComponent() {
    const navigate = useNavigate();
    const {id} = useParams();

    const [formData, setFormData] = useState({
        "id": "",
        "nombre": "",
        "descripcion": "",
        "fechaEvento": "",
        "horaEvento": "",
        "precioMinimo": 0,
        "precioMaximo": 0,
        "localidad": "",
        "genero": "",
        "nombreRecinto": "",
        "imagenUrl": ""
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            findEventById(id)
                .then((event) => {
                    setFormData(event);
                })
                .catch((err) => {
                    setError('No se pudo cargar el evento. ' + (err.message || ''));
                });
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const validarPrecios = (precioMinimo, precioMaximo) => {
        if (precioMinimo < 0 || precioMaximo < 0) {
            return "Los precios no pueden ser negativos.";
        }
        if (precioMaximo < precioMinimo) {
            return "El precio máximo no puede ser menor que el precio mínimo.";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const camposObligatorios = ["nombre", "descripcion", "fechaEvento", "horaEvento", "localidad", "genero"];
        const faltaAlgunCampo = camposObligatorios.some((campo) => !formData[campo]);
        if (faltaAlgunCampo) {
            setError("Por favor, completa todos los campos obligatorios.");
            return;
        }

        const precioMinimo = Number(formData.precioMinimo);
        const precioMaximo = Number(formData.precioMaximo);

        const errorValidacion = validarPrecios(precioMinimo, precioMaximo);
        if (errorValidacion) {
            setError(errorValidacion);
            return;
        }

        setLoading(true);

        const datosParaEnviar = {
            ...formData,
            precioMinimo,
            precioMaximo,
        };

        try {
            if (id) {
                await updateEvent(id, datosParaEnviar);
            } else {
                delete datosParaEnviar.id;
                await createEvent(datosParaEnviar);
            }
            navigate('/');
        } catch (err) {
            setError(id
                ? 'No se pudo actualizar el evento. ' + (err.message || '')
                : 'No se pudo crear el evento. ' + (err.message || ''));
        }
        setLoading(false);
    };

    return (
        <div className="form-container">
            <header className="form-page-header">
                <button
                    type="button"
                    className="form-back-btn"
                    onClick={() => navigate('/')}
                >
                    Volver
                </button>
            </header>
            <form onSubmit={handleSubmit} noValidate>
                <h1>{id ? 'Editar Evento' : 'Crear Nuevo Evento'}</h1>
                {error && <p className="error-message">{error}</p>}
                <label>
                    Nombre:
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Descripcion:
                    <input
                        type="text"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Fecha:
                    <input
                        type="date"
                        name="fechaEvento"
                        value={formData.fechaEvento}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Hora:
                    <input
                        type="time"
                        name="horaEvento"
                        value={formData.horaEvento}
                        onChange={handleChange}
                        step="1"
                        required
                    />
                </label>
                <label>
                    Precio Mínimo:
                    <input
                        type="number"
                        name="precioMinimo"
                        value={formData.precioMinimo}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </label>
                <label>
                    Precio Máximo:
                    <input
                        type="number"
                        name="precioMaximo"
                        value={formData.precioMaximo}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </label>
                <label>
                    Localidad:
                    <input
                        type="text"
                        name="localidad"
                        value={formData.localidad}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Género:
                    <input
                        type="text"
                        name="genero"
                        value={formData.genero}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Nombre del Recinto:
                    <input
                        type="text"
                        name="nombreRecinto"
                        value={formData.nombreRecinto}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    URL de la Imagen:
                    <input
                        type="text"
                        name="imagenUrl"
                        value={formData.imagenUrl}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit" disabled={loading}>
                    {loading
                        ? (id ? 'Actualizando...' : 'Creando...')
                        : (id ? 'Actualizar Evento' : 'Crear Evento')}
                </button>
            </form>
        </div>
    );
}