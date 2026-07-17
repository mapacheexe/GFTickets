import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Evento } from '../models/evento.model';
import { HoraEvento } from '../models/hora-evento.model';

interface EventoApi extends Omit<Evento, 'horaEvento'> {
  horaEvento: HoraEvento | string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/eventos`;

  findAllEvents(): Observable<Evento[]> {
    return this.http.get<EventoApi[]>(this.apiUrl).pipe(
      map((eventos) => eventos.map(this.mapEvento))
    );
  }

  /** Obtiene la información completa de un evento a partir de su identificador. */
  findEventById(id: number): Observable<Evento> {
  return this.http.get<EventoApi>(`${this.apiUrl}/${id}`).pipe(
    map(this.mapEvento),
  );
}

  private mapEvento = (evento: EventoApi): Evento => ({
      ...evento,
      horaEvento: this.normalizarHora(evento.horaEvento),
  });

  private normalizarHora(hora: HoraEvento | string): HoraEvento {
    if (typeof hora !== 'string') {
      return hora;
    }

    const [hour = 0, minute = 0, second = 0] = hora.split(':').map(Number);
    return { hour, minute, second, nano: 0 };
  }
}
