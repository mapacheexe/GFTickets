const BASE_URL = "http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos";

export const findAllEvents = async () => {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error('No se pudieron cargar los eventos');
  }

  return await response.json();
};

export const findEventById = async (id) => {
  const response = await fetch(BASE_URL + '/' + id);

  if (!response.ok){
    throw new Error('No se pudo cargar el evento');
  }

  return await response.json();
}