import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { EventsComponent } from './components/EventsComponent.jsx'
function App() {
  const [events, setEvents] = useState([]);


  return (
    <>
      <EventsComponent eventos = {events}/>
    </>
  )
}

export default App
