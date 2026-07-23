import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from '../context/useAuth.js';
import './AdminLoginComponent.css';

export function AdminLoginComponent() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        if (!username) {
            setError('Debes introducir un nombre de usuario');
            return;
        }

        if (!password) {
            setError('Debes introducir una contraseña');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (username === import.meta.env.VITE_ADMIN_USERNAME && password === import.meta.env.VITE_ADMIN_PASSWORD) {
            setError('');
            login();
            navigate('/');
        } else {
            setError('Nombre de usuario o contraseña incorrectos');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Inicio de Sesión - Administrador</h2>
                <form onSubmit={handleLogin}>
                    <div className="field">
                        <label htmlFor="username">Nombre de usuario:</label>
                        <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="field">
                        <label htmlFor="password">Contraseña:</label>
                        <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type="submit">
                        Iniciar sesión
                    </button>
                </form>
            </div>
        </div>
    );
}