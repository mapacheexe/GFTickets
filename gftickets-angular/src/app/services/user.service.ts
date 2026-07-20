import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { RegistroUsuario, Usuario } from '../models/usuario.model';

export interface UserService {
  registerUser(registro: RegistroUsuario): Observable<Usuario>;
  getCurrentUser(): Observable<Usuario | null>;
}

export const USER_SERVICE = new InjectionToken<UserService>('USER_SERVICE');
