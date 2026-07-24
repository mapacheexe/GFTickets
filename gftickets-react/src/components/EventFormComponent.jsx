import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createEvent, updateEvent, findEventById } from "../services/EventsService";
import './EventFormComponent.css';

const CAMPOS_OBLIGATORIOS = ["nombre", "descripcion", "fechaEvento", "horaEvento", "localidad", "genero"];
const NOMBRE_MAX_LENGTH = 100;
const DESCRIPCION_MAX_LENGTH = 500;

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
    const [fieldErrors, setFieldErrors] = useState({});
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

        // Limpia el error de ese campo en cuanto el usuario lo corrige
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const validarFormulario = (data) => {
        const errores = {};

        CAMPOS_OBLIGATORIOS.forEach((campo) => {
            if (!data[campo]) {
                errores[campo] = "Este campo es obligatorio.";
            }
        });

        if (!errores.nombre && data.nombre && data.nombre.length >= NOMBRE_MAX_LENGTH) {
            errores.nombre = `El nombre no puede tener ${NOMBRE_MAX_LENGTH} caracteres o más.`;
        }

        if (!errores.descripcion && data.descripcion && data.descripcion.length > DESCRIPCION_MAX_LENGTH) {
            errores.descripcion = `La descripción no puede superar los ${DESCRIPCION_MAX_LENGTH} caracteres.`;
        }

        const precioMinimo = Number(data.precioMinimo);
        const precioMaximo = Number(data.precioMaximo);

        if (precioMinimo < 0) {
            errores.precioMinimo = "El precio mínimo no puede ser negativo.";
        }
        if (precioMaximo < 0) {
            errores.precioMaximo = "El precio máximo no puede ser negativo.";
        }
        if (!errores.precioMinimo && !errores.precioMaximo && precioMaximo < precioMinimo) {
            errores.precioMaximo = "No puede ser menor que el precio mínimo.";
        }

        return errores;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const errores = validarFormulario(formData);
        setFieldErrors(errores);

        if (Object.keys(errores).length > 0) {
            return;
        }

        setLoading(true);

        const datosParaEnviar = {
            ...formData,
            precioMinimo: Number(formData.precioMinimo),
            precioMaximo: Number(formData.precioMaximo),
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
                <p className="required-hint">
                    Los campos marcados con <span className="required-asterisk">*</span> son obligatorios.
                </p>
                {error && <p className="error-message">{error}</p>}

                <label>
                    Nombre <span className="required-asterisk">*</span>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        aria-invalid={!!fieldErrors.nombre}
                    />
                    {fieldErrors.nombre && <span className="field-error">{fieldErrors.nombre}</span>}
                </label>

                <label>
                    Descripcion <span className="required-asterisk">*</span>
                    <input
                        type="text"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        aria-invalid={!!fieldErrors.descripcion}
                    />
                    {fieldErrors.descripcion && <span className="field-error">{fieldErrors.descripcion}</span>}
                </label>

                <label>
                    Fecha <span className="required-asterisk">*</span>
                    <input
                        type="date"
                        name="fechaEvento"
                        value={formData.fechaEvento}
                        onChange={handleChange}
                        aria-invalid={!!fieldErrors.fechaEvento}
                    />
                    {fieldErrors.fechaEvento && <span className="field-error">{fieldErrors.fechaEvento}</span>}
                </label>

                <label>
                    Hora <span className="required-asterisk">*</span>
                    <input
                        type="time"
                        name="horaEvento"
                        value={formData.horaEvento}
                        onChange={handleChange}
                        step="1"
                        aria-invalid={!!fieldErrors.horaEvento}
                    />
                    {fieldErrors.horaEvento && <span className="field-error">{fieldErrors.horaEvento}</span>}
                </label>

                <label>
                    Precio Mínimo <span className="required-asterisk">*</span>
                    <input
                        type="number"
                        name="precioMinimo"
                        value={formData.precioMinimo}
                        onChange={handleChange}
                        min="0"
                        aria-invalid={!!fieldErrors.precioMinimo}
                    />
                    {fieldErrors.precioMinimo && <span className="field-error">{fieldErrors.precioMinimo}</span>}
                </label>

                <label>
                    Precio Máximo <span className="required-asterisk">*</span>
                    <input
                        type="number"
                        name="precioMaximo"
                        value={formData.precioMaximo}
                        onChange={handleChange}
                        min="0"
                        aria-invalid={!!fieldErrors.precioMaximo}
                    />
                    {fieldErrors.precioMaximo && <span className="field-error">{fieldErrors.precioMaximo}</span>}
                </label>

                <label>
                    Localidad <span className="required-asterisk">*</span>
                    <input
                        type="text"
                        name="localidad"
                        value={formData.localidad}
                        onChange={handleChange}
                        aria-invalid={!!fieldErrors.localidad}
                    />
                    {fieldErrors.localidad && <span className="field-error">{fieldErrors.localidad}</span>}
                </label>

                <label>
                    Género <span className="required-asterisk">*</span>
                    <input
                        type="text"
                        name="genero"
                        value={formData.genero}
                        onChange={handleChange}
                        aria-invalid={!!fieldErrors.genero}
                    />
                    {fieldErrors.genero && <span className="field-error">{fieldErrors.genero}</span>}
                </label>

                <label>
                    Nombre del Recinto
                    <input
                        type="text"
                        name="nombreRecinto"
                        value={formData.nombreRecinto}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    URL de la Imagen
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