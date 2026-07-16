export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  nombreUsuario: string;
}

export interface RegistroUsuario extends Omit<Usuario, 'id'> {
  password: string;
}
