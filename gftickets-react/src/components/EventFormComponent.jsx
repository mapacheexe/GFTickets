import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createEvent } from "../services/EventsService";
export function EventFormComponent() {
    const navigate = useNavigate();
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const datosParaEnviar = {
            ...formData,
            precioMinimo: Number(formData.precioMinimo),
            precioMaximo: Number(formData.precioMaximo),
        };

        delete datosParaEnviar.id;

        try {
            await createEvent(datosParaEnviar);
            navigate('/');
        } catch (err) {
            setError('No se pudo crear el evento. ' + (err.message || ''));
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
            <form onSubmit={handleSubmit}>
                <h1>Crear Nuevo Evento</h1>
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
                    {loading ? 'Creando...' : 'Crear Evento'}
                </button>
            </form>
        </div>
    );
}
