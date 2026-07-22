import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { RegistroUsuario, Usuario } from '../models/usuario.model';

export interface UserService {
  registerUser(registro: RegistroUsuario): Observable<Usuario>;
  getCurrentUser(): Observable<Usuario | null>;
}

export const USER_SERVICE = new InjectionToken<UserService>('USER_SERVICE');

export interface UserStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const USER_STORAGE = new InjectionToken<UserStorage>('USER_STORAGE', {
  providedIn: 'root',
  factory: () => window.localStorage,
});
