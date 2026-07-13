BASE_URL = "http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos/";

const findAllEvents = async () => {
    const response = await fetch(BASE_URL);
    return await response.json();
}