import { CurrencyPipe } from '@angular/common';
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

import { CompraEntrada, RespuestaCompra } from '../../models/compra-entrada.model';
import { Evento } from '../../models/evento.model';
import { EventService } from '../../services/event.service';
import { PurchaseService } from '../../services/purchase.service';

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
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './purchase.html',
  styleUrl: './purchase.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly purchaseService = inject(PurchaseService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly event = signal<Evento | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

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
    },
    { validators: validExpiryDate },
  );

  ngOnInit(): void {
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
    this.error.set(null);
    this.success.set(null);

    const currentEvent = this.event();
    if (this.form.invalid || currentEvent === null) {
      this.form.markAllAsTouched();
      return;
    }

    if (currentEvent.precioMinimo < 0) {
      this.error.set('Este evento no tiene entradas disponibles para comprar.');
      return;
    }

    const values = this.form.getRawValue();
    const purchase: CompraEntrada = {
      ...values,
      nombreTitular: values.nombreTitular.trim(),
      numeroTarjeta: values.numeroTarjeta.replace(/\D/g, ''),
      mesCaducidad: values.mesCaducidad.padStart(2, '0'),
      concepto: `Entrada para ${currentEvent.nombre}`,
      cantidad: currentEvent.precioMinimo.toFixed(2),
    };

    this.submitting.set(true);
    this.purchaseService
      .createPurchase(purchase)
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
        next: (event) => this.event.set(event),
        error: (error: HttpErrorResponse) => {
          this.error.set(
            error.status === 404
              ? 'No hemos encontrado el evento solicitado.'
              : 'No se han podido cargar los datos del evento.',
          );
        },
      });
  }

  private handleResponse(response: RespuestaCompra): void {
    if (response.error || response.status?.toUpperCase() === 'KO') {
      this.error.set(
        response.message?.join(' ') || response.error || 'La pasarela ha rechazado la compra.',
      );
      return;
    }

    this.success.set(
      response.infoadicional || response.message?.join(' ') || 'Compra registrada correctamente.',
    );
    this.form.reset();
  }
}
