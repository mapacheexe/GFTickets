import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { Evento } from '../../models/evento.model';
import { EventService } from '../../services/event.service';
import { EventCardComponent } from '../event-card/event-card';

@Component({
  selector: 'app-event-list',
  imports: [EventCardComponent],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly events = signal<readonly Evento[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarEventos();
  }

  protected reintentar(): void {
    this.cargarEventos();
  }

  private cargarEventos(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.eventService
      .findAllEvents()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (eventos) => {
          this.events.set(eventos);
        },
        error: (error) => {
          this.error.set('No se han podido cargar los eventos.');
        },
      });
  }
}