import {useNavigate, useParams} from "react-router-dom";
import { findEventById } from "../services/EventsService";
import { useEffect, useState } from "react";
export function EventDetailsComponent (){
    
    const {id} = useParams();
    
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await findEventById(id);
                setEvent(data);
            } catch (error) {
                console.error('Error fetching event details:', error);
            }
        };

        fetchEvent();
    }, []);

    return (
        <>
        </>
    )
}