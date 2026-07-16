import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { CompraEntrada, RespuestaCompra } from '../models/compra-entrada.model';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://teacherbanking.us-east-1.elasticbeanstalk.com/pasarela/compra';

  registerPurchase(compra: CompraEntrada): Observable<RespuestaCompra> {
    return this.http.post<RespuestaCompra>(this.apiUrl, compra);
  }
}
