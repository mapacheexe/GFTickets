import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Evento } from '../models/evento.model';
import { HoraEvento } from '../models/hora-evento.model';

interface EventoApi extends Omit<Evento, 'horaEvento'> {
  horaEvento: HoraEvento | string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos';

  /** Obtiene la información completa de un evento a partir de su identificador. */
  findEventById(id: number): Observable<Evento | null> {
    return this.http.get<EventoApi | null>(`${this.apiUrl}/${id}`).pipe(
      map((evento) =>
        evento
          ? {
              ...evento,
              horaEvento: this.normalizarHora(evento.horaEvento),
            }
          : null,
      ),
    );
  }

  private normalizarHora(hora: HoraEvento | string): HoraEvento {
    if (typeof hora !== 'string') {
      return hora;
    }

    const [hour = 0, minute = 0, second = 0] = hora.split(':').map(Number);
    return { hour, minute, second, nano: 0 };
  }
}
