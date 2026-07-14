import { Routes } from '@angular/router';
import { EventDetailComponent } from './components/event-detail/event-detail';

export const routes: Routes = [
  {
    path: 'eventos/:id',
    component: EventDetailComponent,
    title: 'Detalle del evento | GFTickets',
  },
];
