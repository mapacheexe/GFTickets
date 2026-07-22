import { Routes } from '@angular/router';

import { EventDetailComponent } from './components/event-detail/event-detail';
import { EventListComponent } from './components/event-list/event-list';
import { authGuard } from './guards/auth.guard';

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
    path: 'inicio-sesion',
    loadComponent: () =>
      import('./components/user-login/user-login').then((module) => module.UserLogin),
    title: 'Iniciar sesión | GFTickets',
  },
  {
    path: 'mi-perfil',
    loadComponent: () =>
      import('./components/user-profile/user-profile').then(
        (module) => module.UserProfileComponent,
      ),
    title: 'Mis datos | GFTickets',
  },
  {
    path: 'compra/:eventoId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/purchase/purchase').then((module) => module.PurchaseComponent),
    title: 'Comprar entrada | GFTickets',
  },
  {
    path: 'compras/:purchaseId/cancelar',
    loadComponent: () =>
      import('./components/purchase-cancel/purchase-cancel').then(
        (module) => module.PurchaseCancelComponent,
      ),
    title: 'Cancelar compra | GFTickets',
  },
  {
    path: 'compras/:purchaseId',
    loadComponent: () =>
      import('./components/purchase-detail/purchase-detail').then(
        (module) => module.PurchaseDetailComponent,
      ),
    title: 'Detalle de compra | GFTickets',
  },
  {
    path: 'entradas/:ticketId',
    loadComponent: () =>
      import('./components/ticket-detail/ticket-detail').then(
        (module) => module.TicketDetailComponent,
      ),
    title: 'Detalle de entrada | GFTickets',
  },
  {
    path: '',
    redirectTo: 'eventos',
    pathMatch: 'full',
  },
];
