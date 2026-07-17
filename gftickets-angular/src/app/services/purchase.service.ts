import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { CompraEntrada, PurchaseResult, RespuestaCompra } from '../models/compra-entrada.model';
import { CreditCard } from '../models/credit-card.model';
import { Invoice } from '../models/invoice.model';
import { Transaction } from '../models/transaction.model';
import { LocalPurchaseRepository } from './purchase.repository';

const PAYMENT_RESPONSE_MESSAGES: Readonly<Record<string, string>> = {
  '200.0001': 'Compra registrada correctamente.',
  '400.0001': 'La tarjeta no dispone de fondos suficientes.',
  '400.0002': 'Faltan datos obligatorios para procesar la compra.',
  '400.0003': 'El número de tarjeta no es válido.',
  '400.0004': 'El código de seguridad no es válido.',
  '400.0005': 'El mes de caducidad no es válido.',
  '400.0006': 'El año de caducidad no es válido.',
  '400.0007': 'La tarjeta está caducada.',
  '400.0008': 'El nombre del titular no tiene un formato válido.',
  '500.0001': 'La pasarela de pago no está disponible temporalmente.',
};

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly http = inject(HttpClient);
  private readonly purchaseRepository = inject(LocalPurchaseRepository);
  private readonly apiUrl = 'http://teacherbanking.us-east-1.elasticbeanstalk.com/pasarela/compra';

  buyTickets(userEmail: string, card: CreditCard, invoice: Invoice): Observable<RespuestaCompra> {
    const request: CompraEntrada = {
      nombreTitular: card.cardholderName,
      numeroTarjeta: card.cardNumber,
      mesCaducidad: card.expiryMonth,
      yearCaducidad: card.expiryYear,
      cvv: card.securityCode,
      emisor: card.issuer,
      concepto: invoice.concept,
      cantidad: invoice.totalAmount.toFixed(2),
    };

    return this.http.post<RespuestaCompra>(this.apiUrl, request).pipe(
      tap((response) => {
        if (this.validatePurchase(response).successful) {
          this.purchaseRepository.save(this.createTransaction(userEmail, invoice));
        }
      }),
    );
  }

  validatePurchase(response: RespuestaCompra): PurchaseResult {
    const responseText = [response.error, ...(response.message ?? []), response.infoadicional]
      .filter((value): value is string => Boolean(value))
      .join(' ');
    const code = responseText.match(/\b(?:200|400|500)\.\d{4}\b/)?.[0];
    const rejected = response.status?.toUpperCase() === 'KO' || Boolean(response.error);
    const successful =
      code === '200.0001' || (!rejected && !code?.startsWith('4') && !code?.startsWith('5'));

    return {
      successful,
      code,
      message:
        ((code ? PAYMENT_RESPONSE_MESSAGES[code] : undefined) ?? responseText) ||
        (successful ? 'Compra registrada correctamente.' : 'La pasarela ha rechazado la compra.'),
    };
  }

  private createTransaction(userEmail: string, invoice: Invoice): Transaction {
    return {
      id: crypto.randomUUID(),
      userEmail: userEmail.trim().toLowerCase(),
      invoice,
      createdAt: new Date().toISOString(),
    };
  }
}
