import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, defer, of, throwError } from 'rxjs';

import { RegistroUsuario, Usuario } from '../models/usuario.model';
import { UserService } from './user.service';

export interface UserStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const USER_STORAGE = new InjectionToken<UserStorage>('USER_STORAGE', {
  providedIn: 'root',
  factory: () => window.localStorage,
});

@Injectable()
export class MockUserService implements UserService {
  private readonly storageKey = 'gftickets.current-user';
  private readonly storage = inject(USER_STORAGE);

  registerUser(registro: RegistroUsuario): Observable<Usuario> {
    return defer(() => {
      const usuarioActual = this.readUser();

      if (
        usuarioActual?.email.toLowerCase() === registro.email.toLowerCase() ||
        usuarioActual?.nombreUsuario.toLowerCase() === registro.nombreUsuario.toLowerCase()
      ) {
        return throwError(() => new Error('El correo o el nombre de usuario ya está registrado.'));
      }

      const usuario: Usuario = {
        id: Date.now(),
        nombre: registro.nombre.trim(),
        apellidos: registro.apellidos.trim(),
        email: registro.email.trim(),
        nombreUsuario: registro.nombreUsuario.trim(),
      };

      this.storage.setItem(this.storageKey, JSON.stringify(usuario));
      return of(usuario);
    });
  }

  getCurrentUser(): Observable<Usuario | null> {
    return defer(() => of(this.readUser()));
  }

  private readUser(): Usuario | null {
    const storedUser = this.storage.getItem(this.storageKey);

    if (storedUser === null) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as Usuario;
    } catch {
      this.storage.removeItem(this.storageKey);
      return null;
    }
  }
}
