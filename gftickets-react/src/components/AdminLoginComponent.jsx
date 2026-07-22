import {useNavigate} from "react-router-dom";
import { useState } from "react";
export function AdminLoginComponent() {

    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === '123456') {
            navigate('/');
        } else {
            setError('Nombre de usuario o contraseña incorrectos');
        }
    };

    return (
        <div>
            <h2>Inicio de Sesión - Administrador</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">Nombre de usuario:</label>
                    <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">
                    Iniciar sesión
                </button>
            </form>
        </div>
    );
}