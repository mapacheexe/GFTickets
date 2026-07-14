import { HoraEvento } from './hora-evento.model';

export interface Evento {
  id: number;
  nombre: string;
  descripcion: string;
  fechaEvento: string;
  horaEvento: HoraEvento;
  precioMinimo: number;
  precioMaximo: number;
  localidad: string;
  genero: string;
  nombreRecinto: string;
  imagenUrl: string;
}
