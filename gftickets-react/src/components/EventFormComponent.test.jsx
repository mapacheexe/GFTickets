import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { EventFormComponent } from "./EventFormComponent";
import { createEvent, updateEvent, findEventById } from "../services/EventsService";
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";

// 1. Mockear el servicio de creación/actualización y la navegación
vi.mock("../services/EventsService", () => ({
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    findEventById: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const eventoExistente = {
    id: "1",
    nombre: "Concierto Rock",
    descripcion: "Gran concierto de rock",
    fechaEvento: "2026-10-15",
    horaEvento: "21:00:00",
    precioMinimo: 15,
    precioMaximo: 50,
    localidad: "Madrid",
    genero: "Rock",
    nombreRecinto: "",
    imagenUrl: "",
};

// Renderiza el formulario en modo edición, navegando a /events/:id/edit
const renderEnModoEdicion = (id = "1") => {
    return render(
        <MemoryRouter initialEntries={[`/events/${id}/edit`]}>
            <Routes>
                <Route path="/events/:id/edit" element={<EventFormComponent />} />
            </Routes>
        </MemoryRouter>
    );
};

describe("EventFormComponent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const rellenarFormulario = () => {
        fireEvent.change(screen.getByLabelText(/Nombre \*/i), { target: { value: "Concierto Rock" } });
        fireEvent.change(screen.getByLabelText(/Descripcion \*/i), { target: { value: "Gran concierto de rock" } });
        fireEvent.change(screen.getByLabelText(/Fecha \*/i), { target: { value: "2026-10-15" } });
        fireEvent.change(screen.getByLabelText(/Hora \*/i), { target: { value: "21:00:00" } });
        fireEvent.change(screen.getByLabelText(/Precio Mínimo \*/i), { target: { value: "15" } });
        fireEvent.change(screen.getByLabelText(/Precio Máximo \*/i), { target: { value: "50" } });
        fireEvent.change(screen.getByLabelText(/Localidad \*/i), { target: { value: "Madrid" } });
        fireEvent.change(screen.getByLabelText(/Género \*/i), { target: { value: "Rock" } });
    };

    test("1. Si la creación falla, se muestra un mensaje de error al usuario", async () => {
        createEvent.mockRejectedValueOnce(new Error("Error 400 Bad Request"));

        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        // Validamos que el texto del error aparezca en pantalla
        const mensajeError = await screen.findByText(/No se pudo crear el evento. Error 400 Bad Request/i);
        expect(mensajeError).toBeInTheDocument();
    });

    test("2. No se permite crear un evento con campos obligatorios vacíos", () => {
        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        expect(createEvent).not.toHaveBeenCalled();

        // Ahora los errores aparecen debajo de cada campo obligatorio vacío
        const mensajesError = screen.getAllByText(/Este campo es obligatorio\./i);
        expect(mensajesError.length).toBeGreaterThan(0);
    });

    test("2b. Los errores de campo desaparecen al corregir el valor", () => {
    render(
        <BrowserRouter>
            <EventFormComponent />
        </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Crear Evento/i }));

    const inputNombre = screen.getByLabelText(/Nombre \*/i);

    // El error debería estar presente justo después del input
    expect(inputNombre.nextSibling).toHaveTextContent(/Este campo es obligatorio\./i);

    fireEvent.change(inputNombre, { target: { value: "Concierto Rock" } });

    // El span de error se elimina del DOM (nextSibling ahora es null)
    expect(inputNombre.nextSibling).toBeNull();

    // Y el mensaje ya no está presente en ningún sitio cerca de este campo
    const label = inputNombre.closest("label");
    expect(label).not.toHaveTextContent(/Este campo es obligatorio\./i);
});

    test("3. Mientras se procesa la creación, el botón de guardar permanece deshabilitado", async () => {
        let resolverPromesa;
        createEvent.mockReturnValueOnce(new Promise((resolve) => {
            resolverPromesa = resolve;
        }));

        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        expect(screen.getByRole("button", { name: /Creando.../i })).toBeDisabled();

        resolverPromesa();
    });

    test("4. El formulario redirige correctamente a la raíz tras una creación satisfactoria", async () => {
        createEvent.mockResolvedValueOnce({ success: true });

        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        await waitFor(() => {
            expect(createEvent).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });

    test("5. No se permite crear un evento si el precio máximo es menor que el mínimo", () => {
        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        fireEvent.change(screen.getByLabelText(/Precio Mínimo \*/i), { target: { value: "50" } });
        fireEvent.change(screen.getByLabelText(/Precio Máximo \*/i), { target: { value: "10" } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        expect(screen.getByText(/No puede ser menor que el precio mínimo\./i)).toBeInTheDocument();
        expect(createEvent).not.toHaveBeenCalled();
    });

    test("6. No se permite crear un evento con precio mínimo negativo", () => {
        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        fireEvent.change(screen.getByLabelText(/Precio Mínimo \*/i), { target: { value: "-5" } });
        fireEvent.change(screen.getByLabelText(/Precio Máximo \*/i), { target: { value: "50" } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        expect(screen.getByText(/El precio mínimo no puede ser negativo\./i)).toBeInTheDocument();
        expect(createEvent).not.toHaveBeenCalled();
    });

    test("7. No se permite crear un evento con precio máximo negativo", () => {
        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        fireEvent.change(screen.getByLabelText(/Precio Mínimo \*/i), { target: { value: "0" } });
        fireEvent.change(screen.getByLabelText(/Precio Máximo \*/i), { target: { value: "-10" } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        expect(screen.getByText(/El precio máximo no puede ser negativo\./i)).toBeInTheDocument();
        expect(createEvent).not.toHaveBeenCalled();
    });

    test("8. Se permite crear un evento cuando el precio mínimo y máximo son iguales", async () => {
        createEvent.mockResolvedValueOnce({ success: true });

        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        fireEvent.change(screen.getByLabelText(/Precio Mínimo \*/i), { target: { value: "20" } });
        fireEvent.change(screen.getByLabelText(/Precio Máximo \*/i), { target: { value: "20" } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        await waitFor(() => {
            expect(createEvent).toHaveBeenCalledTimes(1);
        });
    });

    test("9. El formulario informa de que los campos con * son obligatorios", () => {
        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        expect(screen.getByText(/son obligatorios/i)).toBeInTheDocument();
    });

    test("17. No se permite crear un evento si el nombre tiene 100 caracteres o más", () => {
        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        const nombreLargo = "a".repeat(100);
        fireEvent.change(screen.getByLabelText(/Nombre \*/i), { target: { value: nombreLargo } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        expect(screen.getByText(/El nombre no puede tener 100 caracteres o más\./i)).toBeInTheDocument();
        expect(createEvent).not.toHaveBeenCalled();
    });

    test("18. Se permite crear un evento cuando el nombre tiene 99 caracteres (justo por debajo del límite)", async () => {
        createEvent.mockResolvedValueOnce({ success: true });

        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        const nombreValido = "a".repeat(99);
        fireEvent.change(screen.getByLabelText(/Nombre \*/i), { target: { value: nombreValido } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        await waitFor(() => {
            expect(createEvent).toHaveBeenCalledTimes(1);
        });
    });

    test("19. No se permite crear un evento si la descripción supera los 500 caracteres", () => {
        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        const descripcionLarga = "a".repeat(501);
        fireEvent.change(screen.getByLabelText(/Descripcion \*/i), { target: { value: descripcionLarga } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        expect(screen.getByText(/La descripción no puede superar los 500 caracteres\./i)).toBeInTheDocument();
        expect(createEvent).not.toHaveBeenCalled();
    });

    test("20. Se permite crear un evento cuando la descripción tiene exactamente 500 caracteres", async () => {
        createEvent.mockResolvedValueOnce({ success: true });

        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        const descripcionValida = "a".repeat(500);
        fireEvent.change(screen.getByLabelText(/Descripcion \*/i), { target: { value: descripcionValida } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        await waitFor(() => {
            expect(createEvent).toHaveBeenCalledTimes(1);
        });
    });
});

describe("EventFormComponent - Edición de evento existente", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        findEventById.mockResolvedValue(eventoExistente);
    });

    test("10. Cuando hay un id en la ruta, carga los datos del evento y los muestra en el formulario", async () => {
        renderEnModoEdicion("1");

        expect(findEventById).toHaveBeenCalledWith("1");

        await waitFor(() => {
            expect(screen.getByLabelText(/Nombre \*/i)).toHaveValue("Concierto Rock");
        });
        expect(screen.getByLabelText(/Localidad \*/i)).toHaveValue("Madrid");
    });

    test("11. En modo edición se muestra el título 'Editar Evento' y el botón 'Actualizar Evento'", async () => {
        renderEnModoEdicion("1");

        expect(await screen.findByRole("heading", { name: /Editar Evento/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^Actualizar Evento$/i })).toBeInTheDocument();
    });

    test("12. Si falla la carga del evento a editar, se muestra un mensaje de error", async () => {
        findEventById.mockRejectedValueOnce(new Error("Evento no encontrado"));

        renderEnModoEdicion("1");

        const mensajeError = await screen.findByText(/No se pudo cargar el evento. Evento no encontrado/i);
        expect(mensajeError).toBeInTheDocument();
    });

    test("13. Al enviar el formulario en modo edición, se llama a updateEvent (y no a createEvent) con el id y los datos", async () => {
        updateEvent.mockResolvedValueOnce({ success: true });

        renderEnModoEdicion("1");

        await waitFor(() => {
            expect(screen.getByLabelText(/Nombre \*/i)).toHaveValue("Concierto Rock");
        });

        fireEvent.change(screen.getByLabelText(/Nombre \*/i), { target: { value: "Concierto Rock Actualizado" } });

        const botonEnviar = screen.getByRole("button", { name: /^Actualizar Evento$/i });
        fireEvent.click(botonEnviar);

        await waitFor(() => {
            expect(updateEvent).toHaveBeenCalledTimes(1);
            expect(createEvent).not.toHaveBeenCalled();
        });

        const [idEnviado, datosEnviados] = updateEvent.mock.calls[0];
        expect(idEnviado).toBe("1");
        expect(datosEnviados.nombre).toBe("Concierto Rock Actualizado");
    });

    test("14. Tras una actualización satisfactoria, el formulario redirige a la raíz", async () => {
        updateEvent.mockResolvedValueOnce({ success: true });

        renderEnModoEdicion("1");

        await waitFor(() => {
            expect(screen.getByLabelText(/Nombre \*/i)).toHaveValue("Concierto Rock");
        });

        const botonEnviar = screen.getByRole("button", { name: /^Actualizar Evento$/i });
        fireEvent.click(botonEnviar);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });

    test("15. Si la actualización falla, se muestra un mensaje de error específico de edición", async () => {
        updateEvent.mockRejectedValueOnce(new Error("Error 500 Internal Server Error"));

        renderEnModoEdicion("1");

        await waitFor(() => {
            expect(screen.getByLabelText(/Nombre \*/i)).toHaveValue("Concierto Rock");
        });

        const botonEnviar = screen.getByRole("button", { name: /^Actualizar Evento$/i });
        fireEvent.click(botonEnviar);

        const mensajeError = await screen.findByText(/No se pudo actualizar el evento. Error 500 Internal Server Error/i);
        expect(mensajeError).toBeInTheDocument();
    });

    test("16. Mientras se procesa la actualización, el botón permanece deshabilitado y muestra 'Actualizando...'", async () => {
        let resolverPromesa;
        updateEvent.mockReturnValueOnce(new Promise((resolve) => {
            resolverPromesa = resolve;
        }));

        renderEnModoEdicion("1");

        await waitFor(() => {
            expect(screen.getByLabelText(/Nombre \*/i)).toHaveValue("Concierto Rock");
        });

        const botonEnviar = screen.getByRole("button", { name: /^Actualizar Evento$/i });
        fireEvent.click(botonEnviar);

        expect(screen.getByRole("button", { name: /Actualizando.../i })).toBeDisabled();

        resolverPromesa();
    });

    test("21. En modo edición también se valida la longitud máxima del nombre", async () => {
        renderEnModoEdicion("1");

        await waitFor(() => {
            expect(screen.getByLabelText(/Nombre \*/i)).toHaveValue("Concierto Rock");
        });

        const nombreLargo = "a".repeat(100);
        fireEvent.change(screen.getByLabelText(/Nombre \*/i), { target: { value: nombreLargo } });

        const botonEnviar = screen.getByRole("button", { name: /^Actualizar Evento$/i });
        fireEvent.click(botonEnviar);

        expect(screen.getByText(/El nombre no puede tener 100 caracteres o más\./i)).toBeInTheDocument();
        expect(updateEvent).not.toHaveBeenCalled();
    });
});