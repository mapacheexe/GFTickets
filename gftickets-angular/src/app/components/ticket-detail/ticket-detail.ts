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
import { EMPTY, finalize, switchMap, take } from 'rxjs';

import { HoraEvento } from '../../models/hora-evento.model';
import { TicketDetail } from '../../models/ticket-detail.model';
import { PurchaseService } from '../../services/purchase.service';
import { USER_SERVICE } from '../../services/user.service';

@Component({
  selector: 'app-ticket-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly purchaseService = inject(PurchaseService);
  private readonly userService = inject(USER_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ticket = signal<TicketDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly imageUnavailable = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        take(1),
        switchMap((params) => {
          const ticketId = params.get('ticketId')?.trim();

          if (!ticketId) {
            this.error.set('No hemos encontrado la entrada solicitada (error 404).');
            return EMPTY;
          }

          return this.userService.getCurrentUser().pipe(
            take(1),
            switchMap((user) => {
              if (user === null) {
                this.error.set('Debes iniciar sesión para consultar esta entrada.');
                return EMPTY;
              }

              return this.purchaseService.getTicketDetail(ticketId, user.email);
            }),
          );
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (ticket) => {
          if (ticket === null) {
            this.error.set('No hemos encontrado la entrada solicitada (error 404).');
            return;
          }

          this.ticket.set(ticket);
        },
        error: () => this.error.set('No se han podido cargar los datos de la entrada.'),
      });
  }

  protected formatEventTime(time: HoraEvento): string {
    const hour = String(time.hour).padStart(2, '0');
    const minute = String(time.minute).padStart(2, '0');
    return `${hour}:${minute}`;
  }

  protected formatEventDate(date: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : date;
  }
}
