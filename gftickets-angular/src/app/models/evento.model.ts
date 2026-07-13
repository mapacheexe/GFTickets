export interface Evento {
  id?: number;
  nombre: string;
  descripcion: string;
  fechaEvento: string;
  horaEvento: string;
  precioMinimo: number;
  precioMaximo: number;
  localidad: string;
  genero: string;
  nombreRecinto: string;
  imagenUrl: string;
}
