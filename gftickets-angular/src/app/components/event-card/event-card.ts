import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Evento } from '../../models/evento.model';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-event-card',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCardComponent {
  private readonly authState = inject(AuthStateService);

  readonly event = input.required<Evento>();

  protected readonly imagenNoDisponible = signal(false);
  protected readonly isAuthenticated = this.authState.isAuthenticated;
}
