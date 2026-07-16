import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CompraEntrada } from '../models/compra-entrada.model';
import { PurchaseService } from './purchase.service';

describe('PurchaseService', () => {
  const purchase: CompraEntrada = {
    nombreTitular: 'Julia Adell',
    numeroTarjeta: '4111111111111111',
    mesCaducidad: '12',
    yearCaducidad: '2030',
    cvv: '123',
    emisor: 'VISA',
    concepto: 'Entrada para Festival',
    cantidad: '35.00',
  };

  it('envía la compra a la pasarela mediante POST', () => {
    TestBed.configureTestingModule({
      providers: [PurchaseService, provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(PurchaseService);
    const http = TestBed.inject(HttpTestingController);

    service.createPurchase(purchase).subscribe((response) => {
      expect(response.status).toBe('OK');
    });

    const request = http.expectOne(
      'http://teacherbanking.us-east-1.elasticbeanstalk.com/pasarela/compra',
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(purchase);
    request.flush({ status: 'OK' });
    http.verify();
  });
});
