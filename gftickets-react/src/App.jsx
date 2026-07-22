import './App.css'
import { EventsComponent } from './components/EventsComponent.jsx';
import { EventDetailsComponent } from './components/EventDetailsComponent.jsx';
import { AdminLoginComponent } from './components/AdminLoginComponent.jsx';
import { createBrowserRouter, RouterProvider, Outlet, Link } from "react-router-dom";
import { EventFormComponent } from './components/EventFormComponent.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

function Layout() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="GFTickets, inicio">
          <span className="brand-mark" aria-hidden="true">GFT</span>
          <span>ickets (Back Office)</span>
        </Link>
        <nav aria-label="Navegación principal">
          <Link to="/">Eventos</Link>
          <Link to="/form">Añadir Evento</Link>
          {isAuthenticated ? (
            <button onClick={logout}>Cerrar sesión</button>
          ) : (
            <Link to="/login">Iniciar Sesión</Link>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/login", element: <AdminLoginComponent /> },
      {
        path: "/",
        element: <ProtectedRoute><EventsComponent /></ProtectedRoute>,
      },
      {
        path: "/eventos/:id",
        element: <ProtectedRoute><EventDetailsComponent /></ProtectedRoute>,
      },
      {
        path: "/form",
        element: <ProtectedRoute><EventFormComponent /></ProtectedRoute>,
      },
      {
        path: "/form/:id",
        element: <ProtectedRoute><EventFormComponent /></ProtectedRoute>,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App