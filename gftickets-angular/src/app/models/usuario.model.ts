export interface Usuario {
  id: string;
  displayName: string;
  email: string;
  nombreUsuario: string;
}

export interface RegistroUsuario extends Omit<Usuario, 'id'> {
  password: string;
}
