import './App.css'
import { EventsComponent } from './components/EventsComponent.jsx';
import { EventDetailsComponent } from './components/EventDetailsComponent.jsx';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <EventsComponent />
    },
    {
      path: "/eventos/:id",
      element: <EventDetailsComponent />
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}



export default App
