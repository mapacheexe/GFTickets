import './App.css'
import { EventsComponent } from './components/EventsComponent.jsx';
import { EventDetailsComponent } from './components/EventDetailsComponent.jsx';
import { createBrowserRouter, RouterProvider, Outlet, Link } from "react-router-dom";

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
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App