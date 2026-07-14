import { useEffect, useState } from 'react'
import './App.css'
import { EventsComponent } from './components/EventsComponent.jsx';
import {findAllEvents} from './services/EventsService.js';
function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);
        const data = await findAllEvents();
        setEvents(data);
      } catch (error) {
        console.log("error al traer los eventos del servicio: ", error);
      } finally{
        setLoading(false);
      }
    }

    cargarEventos();
  }, []);

  return (
    <>
      {loading ? (
        <div>Cargando eventos...</div>
      ) : (
      <EventsComponent eventos={events} />
      )}
    </>
  )
}

export default App
