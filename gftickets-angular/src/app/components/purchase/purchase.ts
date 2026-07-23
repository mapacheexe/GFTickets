import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { RespuestaCompra } from '../../models/compra-entrada.model';
import { CreditCard } from '../../models/credit-card.model';
import { Evento } from '../../models/evento.model';
import { Invoice } from '../../models/invoice.model';
import { EventService } from '../../services/event.service';
import { PurchaseService } from '../../services/purchase.service';
import { USER_SERVICE } from '../../services/user.service';

function validCardNumber(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value).trim();
  if (!/^[\d -]+$/.test(value)) {
    return { invalidCardNumber: true };
  }

  const digits = value.replace(/\D/g, '');
  return digits.length >= 13 && digits.length <= 19 ? null : { invalidCardNumber: true };
}

function validExpiryDate(control: AbstractControl): ValidationErrors | null {
  const month = Number(control.get('mesCaducidad')?.value);
  const year = Number(control.get('yearCaducidad')?.value);

  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) {
    return null;
  }

  const today = new Date();
  const hasExpired =
    year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1);
  return hasExpired ? { expiredCard: true } : null;
}

@Component({
  selector: 'app-purchase',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './purchase.html',
  styleUrl: './purchase.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly purchaseService = inject(PurchaseService);
  private readonly userService = inject(USER_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly event = signal<Evento | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  private readonly currentUserEmail = signal<string | null>(null);

  protected readonly form = new FormGroup(
    {
      nombreTitular: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      numeroTarjeta: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, validCardNumber],
      }),
      mesCaducidad: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^(0?[1-9]|1[0-2])$/)],
      }),
      yearCaducidad: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\d{4}$/)],
      }),
      cvv: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\d{3,4}$/)],
      }),
      emisor: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      ticketQuantity: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
      }),
    },
    { validators: validExpiryDate },
  );

  ngOnInit(): void {
    this.userService
      .getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => this.currentUserEmail.set(user?.email ?? null),
        error: () => this.currentUserEmail.set(null),
      });

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const eventId = Number(params.get('eventoId'));

      if (!Number.isInteger(eventId) || eventId <= 0) {
        this.loading.set(false);
        this.error.set('El identificador del evento no es válido.');
        return;
      }

      this.loadEvent(eventId);
    });
  }

  protected createPurchase(): void {
    if (this.submitting()) {
      return;
    }

    this.error.set(null);
    this.success.set(null);

    const currentEvent = this.event();
    const userEmail = this.currentUserEmail();
    if (this.form.invalid || currentEvent === null) {
      this.form.markAllAsTouched();
      return;
    }

    if (userEmail === null) {
      this.error.set('Debes acceder a tu cuenta antes de registrar una compra.');
      return;
    }

    if (!this.hasAvailablePrice(currentEvent)) {
      this.error.set('Este evento no tiene entradas disponibles para comprar.');
      return;
    }

    const values = this.form.getRawValue();
    const card: CreditCard = {
      cardholderName: values.nombreTitular.trim(),
      cardNumber: values.numeroTarjeta.replace(/\D/g, ''),
      expiryMonth: values.mesCaducidad.padStart(2, '0'),
      expiryYear: values.yearCaducidad,
      securityCode: values.cvv,
      issuer: values.emisor,
    };
    const invoice: Invoice = {
      eventId: currentEvent.id,
      eventName: currentEvent.nombre,
      eventDate: currentEvent.fechaEvento,
      venueName: currentEvent.nombreRecinto,
      concept: `${values.ticketQuantity} entrada(s) para ${currentEvent.nombre}`,
      ticketQuantity: values.ticketQuantity,
      unitPrice: currentEvent.precioMinimo,
      totalAmount: this.totalAmount(),
    };

    this.submitting.set(true);
    this.purchaseService
      .buyTickets(userEmail, card, invoice)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: (error: HttpErrorResponse) => {
          this.error.set(
            error.status === 0
              ? 'No se ha podido conectar con la pasarela de pago.'
              : 'No se ha podido registrar la compra. Revisa los datos e inténtalo de nuevo.',
          );
        },
      });
  }

  protected totalAmount(): number {
    const unitPrice = this.event()?.precioMinimo ?? 0;
    const quantity = this.form.controls.ticketQuantity.value;

    return Number.isInteger(quantity) && quantity > 0 ? unitPrice * quantity : 0;
  }

  private loadEvent(eventId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventService
      .findEventById(eventId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (event) => {
          if (!this.hasAvailablePrice(event)) {
            this.event.set(null);
            this.error.set('Este evento no tiene entradas disponibles para comprar.');
            return;
          }

          this.event.set(event);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(
            error.status === 404
              ? 'No hemos encontrado el evento solicitado.'
              : 'No se han podido cargar los datos del evento.',
          );
        },
      });
  }

  private hasAvailablePrice(event: Evento): boolean {
    return event.precioMinimo >= 0 && event.precioMaximo >= 0;
  }

  private handleResponse(response: RespuestaCompra): void {
    const result = this.purchaseService.validatePurchase(response);

    if (!result.successful) {
      this.error.set(result.message);
      return;
    }

    this.success.set(result.message);
    this.form.reset({ ticketQuantity: 1 });
  }
}
