export interface CompraEntrada {
  nombreTitular: string;
  numeroTarjeta: string;
  mesCaducidad: string;
  yearCaducidad: string;
  cvv: string;
  emisor: string;
  concepto: string;
  cantidad: string;
}

export interface RespuestaCompra {
  timestamp?: string;
  status?: string;
  error?: string;
  message?: string[];
  infoadicional?: string;
}
