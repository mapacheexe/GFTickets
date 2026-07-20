import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Evento } from '../../models/evento.model';

@Component({
  selector: 'app-event-card',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCardComponent {
  readonly event = input.required<Evento>();

  protected readonly imagenNoDisponible = signal(false);
}