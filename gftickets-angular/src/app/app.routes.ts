import { Routes } from '@angular/router';
import { EventDetail } from './components/event-detail/event-detail';

export const routes: Routes = [
  {
    path: 'eventos/:id',
    component: EventDetail,
    title: 'Detalle del evento | GFTickets',
  },
];
