const BASE_URL = "http://teacherbanking.us-east-1.elasticbeanstalk.com/";

export const findAllEvents = async () => {
    const respone = await fetch(BASE_URL);
    return await respone.json();
}