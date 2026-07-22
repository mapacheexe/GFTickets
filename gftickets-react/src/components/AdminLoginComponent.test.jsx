import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminLoginComponent } from './AdminLoginComponent.jsx';
import { AuthContext } from '../context/auth-context.js';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockNavigate = vi.fn();

function renderLogin({ login = vi.fn() } = {}) {
    render(
        <AuthContext.Provider value={{ isAuthenticated: false, login, logout: vi.fn() }}>
            <MemoryRouter>
                <AdminLoginComponent />
            </MemoryRouter>
        </AuthContext.Provider>
    );
    return { login };
}

function fillForm({ username, password }) {
    if (username !== undefined) {
        fireEvent.change(screen.getByLabelText(/nombre de usuario/i), {
            target: { value: username },
        });
    }
    if (password !== undefined) {
        fireEvent.change(screen.getByLabelText(/contraseña/i), {
            target: { value: password },
        });
    }
}

function submit() {
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
}

describe('AdminLoginComponent', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        import.meta.env.VITE_ADMIN_USERNAME = 'admin';
        import.meta.env.VITE_ADMIN_PASSWORD = '123456';
    });

    it('Prueba: login admin con credenciales válidas accede al panel', () => {
        const { login } = renderLogin();

        fillForm({ username: 'admin', password: '123456' });
        submit();

        expect(login).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('Prueba: no permite iniciar sesión sin escribir nombre de usuario, muestra mensaje de error', () => {
        const { login } = renderLogin();

        fillForm({ username: '', password: '123456' });
        submit();

        expect(screen.getByText(/debes introducir un nombre de usuario/i)).toBeInTheDocument();
        expect(login).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('Prueba: no permite iniciar sesión sin escribir contraseña, muestra mensaje de error', () => {
        const { login } = renderLogin();

        fillForm({ username: 'admin', password: '' });
        submit();

        expect(screen.getByText(/debes introducir una contraseña/i)).toBeInTheDocument();
        expect(login).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('Prueba: login admin con credenciales inválidas muestra error', () => {
        const { login } = renderLogin();

        fillForm({ username: 'admin', password: 'incorrecta' });
        submit();

        expect(screen.getByText(/nombre de usuario o contraseña incorrectos/i)).toBeInTheDocument();
        expect(login).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('Prueba: no permite iniciar sesión con contraseña de menos de 6 caracteres', () => {
        const { login } = renderLogin();

        fillForm({ username: 'admin', password: '123' });
        submit();

        expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
        expect(login).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});