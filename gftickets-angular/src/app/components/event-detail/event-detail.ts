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

import { EVENT_DESCRIPTION_PREVIEW_LIMIT } from '../../constants/event.constants';
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

  protected readonly event = signal<Evento | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly imageNotAvailable = signal(false);
  protected readonly descripcionExpandida = signal(false);

  private eventId: number | null = null;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));

      if (!Number.isInteger(id) || id <= 0) {
        this.eventId = null;
        this.event.set(null);
        this.isLoading.set(false);
        this.error.set('El identificador del evento no es válido.');
        return;
      }

      this.eventId = id;
      this.cargarEvento(id);
    });
  }

  protected reintentar(): void {
    if (this.eventId !== null) {
      this.cargarEvento(this.eventId);
    }
  }

  protected horaCorta(hora: HoraEvento): string {
    return `${hora.hour.toString().padStart(2, '0')}:${hora.minute.toString().padStart(2, '0')}`;
  }

  protected esDescripcionLarga(descripcion: string): boolean {
    return descripcion.length > EVENT_DESCRIPTION_PREVIEW_LIMIT;
  }

  protected descripcionMostrada(descripcion: string): string {
    if (this.descripcionExpandida() || !this.esDescripcionLarga(descripcion)) {
      return descripcion;
    }

    return `${descripcion.slice(0, EVENT_DESCRIPTION_PREVIEW_LIMIT).trimEnd()}…`;
  }

  protected alternarDescripcion(): void {
    this.descripcionExpandida.update((expandida) => !expandida);
  }

  private cargarEvento(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.event.set(null);
    this.imageNotAvailable.set(false);
    this.descripcionExpandida.set(false);

    this.eventService
      .findEventById(id)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (evento) => {
          if (evento === null) {
            this.error.set('No se pudo cargar el evento.');
            return;
          }

          this.event.set(evento);
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
