import { Routes } from '@angular/router';

import { EventDetailComponent } from './components/event-detail/event-detail';
import { EventListComponent } from './components/event-list/event-list';

export const routes: Routes = [
  {
    path: 'eventos',
    component: EventListComponent,
    title: 'Eventos | GFTickets',
  },
  {
    path: 'eventos/:id',
    component: EventDetailComponent,
    title: 'Detalle del evento | GFTickets',
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/user-registration/user-registration').then(
        (module) => module.UserRegistrationComponent,
      ),
    title: 'Crear una cuenta | GFTickets',
  },
  {
    path: 'compra/:eventoId',
    loadComponent: () =>
      import('./components/purchase/purchase').then((module) => module.PurchaseComponent),
    title: 'Comprar entrada | GFTickets',
  },
  {
    path: '',
    redirectTo: 'eventos',
    pathMatch: 'full',
  },
];
