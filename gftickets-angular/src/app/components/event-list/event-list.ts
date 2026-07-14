import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { Evento } from '../../models/evento.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-list',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly eventos = signal<readonly Evento[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarEventos();
  }

  protected reintentar(): void {
    this.cargarEventos();
  }

  private cargarEventos(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.eventService
      .findAllEvents()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (eventos) => {
          this.eventos.set(eventos);
        },

        error: (error: HttpErrorResponse) => {
          this.error.set(this.obtenerMensajeError(error));
        },
      });
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    return error.status === 404
      ? 'No hay eventos disponibles.'
      : 'No se han podido cargar los eventos. Inténtalo de nuevo.';
  }
}