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

import { PurchaseService } from '../../services/purchase.service';
import { USER_SERVICE } from '../../services/user.service';

@Component({
  selector: 'app-purchase-cancel',
  imports: [RouterLink],
  templateUrl: './purchase-cancel.html',
  styleUrl: './purchase-cancel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseCancelComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly purchaseService = inject(PurchaseService);
  private readonly userService = inject(USER_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly purchaseId = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly cancelled = signal(false);
  protected readonly error = signal<string | null>(null);
  private readonly userEmail = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        take(1),
        switchMap((params) => {
          const purchaseId = params.get('purchaseId')?.trim();

          if (!purchaseId) {
            this.error.set('No hemos encontrado la compra solicitada (error 404).');
            return EMPTY;
          }

          this.purchaseId.set(purchaseId);
          return this.userService.getCurrentUser().pipe(take(1));
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (user) => {
          if (user === null) {
            this.error.set('Debes iniciar sesión para cancelar esta compra.');
            return;
          }

          this.userEmail.set(user.email);
        },
        error: () => this.error.set('No se ha podido comprobar la sesión del usuario.'),
      });
  }

  protected confirmCancellation(): void {
    const purchaseId = this.purchaseId();
    const userEmail = this.userEmail();

    if (this.submitting() || purchaseId === null || userEmail === null) {
      return;
    }

    this.error.set(null);
    this.submitting.set(true);
    this.purchaseService
      .cancelPurchase(purchaseId, userEmail)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (removed) => {
          if (!removed) {
            this.error.set('No hemos encontrado la compra solicitada (error 404).');
            return;
          }

          this.cancelled.set(true);
        },
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error
              ? error.message
              : 'No se ha podido cancelar la compra. Inténtalo de nuevo.',
          ),
      });
  }
}
