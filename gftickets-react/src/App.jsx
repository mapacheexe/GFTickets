import './App.css'
import { EventsComponent } from './components/EventsComponent.jsx';
import { EventDetailsComponent } from './components/EventDetailsComponent.jsx';
import { AdminLoginComponent } from './components/AdminLoginComponent.jsx';
import { createBrowserRouter, RouterProvider, Outlet, Link } from "react-router-dom";
import { EventFormComponent } from './components/EventFormComponent.jsx';

function Layout() {
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
          <Link to="/login">Iniciar Sesión</Link>
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
      { path: "/", element: <EventsComponent /> },
      { path: "/eventos/:id", element: <EventDetailsComponent /> },
      { path: "/form", element: <EventFormComponent />},
      { path: "/form/:id", element: <EventFormComponent /> },
      { path: "/login", element: <AdminLoginComponent /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App