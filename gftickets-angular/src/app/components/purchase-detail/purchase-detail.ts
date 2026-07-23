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

import { Transaction } from '../../models/transaction.model';
import { PurchaseService } from '../../services/purchase.service';
import { USER_SERVICE } from '../../services/user.service';

@Component({
  selector: 'app-purchase-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './purchase-detail.html',
  styleUrl: './purchase-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly purchaseService = inject(PurchaseService);
  private readonly userService = inject(USER_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly purchase = signal<Transaction | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

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

          return this.userService.getCurrentUser().pipe(
            take(1),
            switchMap((user) => {
              if (user === null) {
                this.error.set('Debes iniciar sesión para consultar esta compra.');
                return EMPTY;
              }

              return this.purchaseService.getPurchaseById(purchaseId, user.email);
            }),
          );
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (purchase) => {
          if (purchase === null) {
            this.error.set('No hemos encontrado la compra solicitada (error 404).');
            return;
          }

          this.purchase.set(purchase);
        },
        error: () => this.error.set('No se han podido cargar los datos de la compra.'),
      });
  }
}
