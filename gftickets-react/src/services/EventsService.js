
export const findAllEvents = async () => {
  const response = await fetch(import.meta.env.VITE_API_URL);

  if (!response.ok) {
    throw new Error('No se pudieron cargar los eventos');
  }

  return await response.json();
};

export const findEventById = async (id) => {
  const response = await fetch(import.meta.env.VITE_API_URL + '/' + id);

  if (!response.ok){
    throw new Error('No se pudo cargar el evento');
  }

  return await response.json();
}

export const createEvent = async (eventData) => {
  const response = await fetch(import.meta.env.VITE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    throw new Error('No se pudo crear el evento');
  }
  return await response.json();
};

export const deleteEvent = async (id) => {
  const response = await fetch(import.meta.env.VITE_API_URL + '/' + id, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('No se pudo eliminar el evento');
  }
  return await response.json();
};