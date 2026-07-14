import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Evento } from '../../models/evento.model';
import { HoraEvento } from '../../models/hora-evento.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly evento = signal<Evento | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly imagenNoDisponible = signal(false);

  private eventoId: number | null = null;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));

      if (!Number.isInteger(id) || id <= 0) {
        this.eventoId = null;
        this.evento.set(null);
        this.cargando.set(false);
        this.error.set('El identificador del evento no es válido.');
        return;
      }

      this.eventoId = id;
      this.cargarEvento(id);
    });
  }

  protected reintentar(): void {
    if (this.eventoId !== null) {
      this.cargarEvento(this.eventoId);
    }
  }

  protected horaCorta(hora: HoraEvento): string {
    return `${hora.hour.toString().padStart(2, '0')}:${hora.minute.toString().padStart(2, '0')}`;
  }

  private cargarEvento(id: number): void {
    this.cargando.set(true);
    this.error.set(null);
    this.evento.set(null);
    this.imagenNoDisponible.set(false);

    this.eventService
      .findEventById(id)
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (evento) => {
          if (evento === null) {
            this.error.set('No se pudo cargar el evento.');
            return;
          }

          this.evento.set(evento);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(
            error.status === 404
              ? 'No hemos encontrado el evento solicitado.'
              : 'No se ha podido cargar el evento. Inténtalo de nuevo.',
          );
        },
      });
  }
}
