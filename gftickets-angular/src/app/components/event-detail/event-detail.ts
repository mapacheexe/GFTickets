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
import { AuthStateService } from '../../services/auth-state.service';

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
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly event = signal<Evento | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly isImageAvailable = signal(false);
  protected readonly expandedDescription = signal(false);
  protected readonly isAuthenticated = this.authState.isAuthenticated;

  private eventoId: number | null = null;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));

      if (!Number.isInteger(id) || id <= 0) {
        this.eventoId = null;
        this.event.set(null);
        this.isLoading.set(false);
        this.error.set('El identificador del evento no es válido.');
        return;
      }

      this.eventoId = id;
      this.loadEvent(id);
    });
  }

  protected retry(): void {
    if (this.eventoId !== null) {
      this.loadEvent(this.eventoId);
    }
  }

  protected shortFormatHour(hora: HoraEvento): string {
    return `${hora.hour.toString().padStart(2, '0')}:${hora.minute.toString().padStart(2, '0')}`;
  }

  protected isLongerThanPreviewLimit(descripcion: string): boolean {
    return descripcion.length > EVENT_DESCRIPTION_PREVIEW_LIMIT;
  }

  protected descripcionMostrada(descripcion: string): string {
    if (this.expandedDescription() || !this.isLongerThanPreviewLimit(descripcion)) {
      return descripcion;
    }
    return `${descripcion.slice(0, EVENT_DESCRIPTION_PREVIEW_LIMIT).trimEnd()}…`;
  }

  protected alternateDescrition(): void {
    this.expandedDescription.update((expanded) => !expanded);
  }

  private loadEvent(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.event.set(null);
    this.isImageAvailable.set(true);
    this.expandedDescription.set(false);

    this.eventService
      .findEventById(id)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (event) => {
          if (event === null) {
            this.error.set('No se pudo cargar el evento.');
            return;
          }

          this.event.set(event);
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
