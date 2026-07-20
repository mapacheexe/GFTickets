import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { EventFormComponent } from "./EventFormComponent";
import { createEvent } from "../services/EventsService";
import { BrowserRouter } from "react-router-dom";

// 1. Mockear el servicio de creación y la navegación
vi.mock("../services/EventsService", () => ({
    createEvent: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("EventFormComponent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const rellenarFormulario = () => {
        fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: "Concierto Rock" } });
        fireEvent.change(screen.getByLabelText(/Descripcion:/i), { target: { value: "Gran concierto de rock" } });
        fireEvent.change(screen.getByLabelText(/Fecha:/i), { target: { value: "2026-10-15" } });
        fireEvent.change(screen.getByLabelText(/Hora:/i), { target: { value: "21:00:00" } });
        fireEvent.change(screen.getByLabelText(/Precio Mínimo:/i), { target: { value: "15" } });
        fireEvent.change(screen.getByLabelText(/Precio Máximo:/i), { target: { value: "50" } });
        fireEvent.change(screen.getByLabelText(/Localidad:/i), { target: { value: "Madrid" } });
        fireEvent.change(screen.getByLabelText(/Género:/i), { target: { value: "Rock" } });
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

        fireEvent.change(screen.getByLabelText(/Precio Mínimo:/i), { target: { value: "50" } });
        fireEvent.change(screen.getByLabelText(/Precio Máximo:/i), { target: { value: "10" } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        expect(screen.getByText(/El precio máximo no puede ser menor que el precio mínimo\./i)).toBeInTheDocument();
        expect(createEvent).not.toHaveBeenCalled();
    });

    test("6. No se permite crear un evento con precio mínimo negativo", () => {
        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        fireEvent.change(screen.getByLabelText(/Precio Mínimo:/i), { target: { value: "-5" } });
        fireEvent.change(screen.getByLabelText(/Precio Máximo:/i), { target: { value: "50" } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        expect(screen.getByText(/Los precios no pueden ser negativos\./i)).toBeInTheDocument();
        expect(createEvent).not.toHaveBeenCalled();
    });

    test("7. No se permite crear un evento con precio máximo negativo", () => {
        render(
            <BrowserRouter>
                <EventFormComponent />
            </BrowserRouter>
        );

        rellenarFormulario();

        fireEvent.change(screen.getByLabelText(/Precio Mínimo:/i), { target: { value: "0" } });
        fireEvent.change(screen.getByLabelText(/Precio Máximo:/i), { target: { value: "-10" } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        expect(screen.getByText(/Los precios no pueden ser negativos\./i)).toBeInTheDocument();
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

        fireEvent.change(screen.getByLabelText(/Precio Mínimo:/i), { target: { value: "20" } });
        fireEvent.change(screen.getByLabelText(/Precio Máximo:/i), { target: { value: "20" } });

        const botonEnviar = screen.getByRole("button", { name: /Crear Evento/i });
        fireEvent.click(botonEnviar);

        await waitFor(() => {
            expect(createEvent).toHaveBeenCalledTimes(1);
        });
    });
});