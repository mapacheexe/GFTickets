import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, catchError, defer, map, of, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { RegistroUsuario, Usuario } from '../models/usuario.model';
import { UserService, UserStorage } from './user.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface FirebaseAuthResponse {
  kind?: string;
  localId: string;
  email: string;
  displayName?: string;
  idToken: string;
  registered?: boolean;
  refreshToken: string;
  expiresIn: string;
}

interface FirebaseUserInfo {
  localId: string;
  email: string;
  displayName?: string;
}

interface FirebaseLookupResponse {
  users?: FirebaseUserInfo[];
}

interface FirebaseSession {
  idToken: string;
  refreshToken: string;
  user: Usuario;
}

export const FIREBASE_SESSION_STORAGE = new InjectionToken<UserStorage>(
  'FIREBASE_SESSION_STORAGE',
  {
    providedIn: 'root',
    factory: () => window.sessionStorage,
  },
);

@Injectable({ providedIn: 'root' })
export class FirebaseUserService implements UserService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(FIREBASE_SESSION_STORAGE);
  private readonly apiKey = environment.firebase.apiKey;
  private readonly authUrl = 'https://identitytoolkit.googleapis.com/v1';
  private readonly storageKey = 'gftickets.firebase-session';

  registerUser(registration: RegistroUsuario): Observable<Usuario> {
    const displayName = `${registration.nombre.trim()} ${registration.apellidos.trim()}`.trim();

    return this.http
      .post<FirebaseAuthResponse>(`${this.authUrl}/accounts:signUp?key=${this.apiKey}`, {
        email: registration.email.trim(),
        password: registration.password,
        displayName,
        returnSecureToken: true,
      })
      .pipe(
        map((response) => {
          const user: Usuario = {
            id: response.localId,
            nombre: registration.nombre.trim(),
            apellidos: registration.apellidos.trim(),
            email: response.email,
            nombreUsuario: registration.nombreUsuario.trim(),
          };
          this.saveSession(response, user);
          return user;
        }),
        catchError((error: unknown) =>
          throwError(() => this.toAuthenticationError(error, 'No se ha podido crear la cuenta.')),
        ),
      );
  }

  loginUser(credentials: LoginRequest): Observable<Usuario> {
    return this.http
      .post<FirebaseAuthResponse>(
        `${this.authUrl}/accounts:signInWithPassword?key=${this.apiKey}`,
        {
          email: credentials.email.trim(),
          password: credentials.password,
          returnSecureToken: true,
        },
      )
      .pipe(
        map((response) => {
          const names = this.splitDisplayName(response.displayName);
          const user: Usuario = {
            id: response.localId,
            nombre: names.nombre,
            apellidos: names.apellidos,
            email: response.email,
            nombreUsuario: response.email.split('@')[0],
          };
          this.saveSession(response, user);
          return user;
        }),
        catchError((error: unknown) =>
          throwError(() => this.toAuthenticationError(error, 'No se ha podido iniciar sesión.')),
        ),
      );
  }

  getCurrentUser(): Observable<Usuario | null> {
    return defer(() => {
      const session = this.readSession();

      if (session === null) {
        return of(null);
      }

      return this.http
        .post<FirebaseLookupResponse>(`${this.authUrl}/accounts:lookup?key=${this.apiKey}`, {
          idToken: session.idToken,
        })
        .pipe(
          map((response) => {
            const firebaseUser = response.users?.[0];

            if (firebaseUser === undefined) {
              this.clearSession();
              return null;
            }

            const names = firebaseUser.displayName
              ? this.splitDisplayName(firebaseUser.displayName)
              : { nombre: session.user.nombre, apellidos: session.user.apellidos };
            const user: Usuario = {
              ...session.user,
              ...names,
              id: firebaseUser.localId,
              email: firebaseUser.email,
            };
            this.storage.setItem(this.storageKey, JSON.stringify({ ...session, user }));
            return user;
          }),
          catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse && [400, 401].includes(error.status)) {
              this.clearSession();
              return of(null);
            }

            return throwError(() => new Error('No se han podido cargar los datos del usuario.'));
          }),
        );
    });
  }

  private saveSession(response: FirebaseAuthResponse, user: Usuario): void {
    const session: FirebaseSession = {
      idToken: response.idToken,
      refreshToken: response.refreshToken,
      user,
    };
    this.storage.setItem(this.storageKey, JSON.stringify(session));
  }

  private readSession(): FirebaseSession | null {
    const storedSession = this.storage.getItem(this.storageKey);

    if (storedSession === null) {
      return null;
    }

    try {
      const session = JSON.parse(storedSession) as Partial<FirebaseSession>;
      if (
        typeof session.idToken !== 'string' ||
        typeof session.refreshToken !== 'string' ||
        session.user === undefined
      ) {
        this.clearSession();
        return null;
      }
      return session as FirebaseSession;
    } catch {
      this.clearSession();
      return null;
    }
  }

  private clearSession(): void {
    this.storage.removeItem(this.storageKey);
  }

  private splitDisplayName(displayName?: string): Pick<Usuario, 'nombre' | 'apellidos'> {
    const [nombre = '', ...remainingNames] = displayName?.trim().split(/\s+/) ?? [];
    return { nombre, apellidos: remainingNames.join(' ') };
  }

  private toAuthenticationError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof HttpErrorResponse) {
      const firebaseCode = (error.error as { error?: { message?: string } } | null)?.error?.message;
      const messages: Readonly<Record<string, string>> = {
        EMAIL_EXISTS: 'El correo ya está registrado.',
        INVALID_LOGIN_CREDENTIALS: 'El correo o la contraseña no son correctos.',
        EMAIL_NOT_FOUND: 'El correo o la contraseña no son correctos.',
        INVALID_PASSWORD: 'El correo o la contraseña no son correctos.',
        USER_DISABLED: 'La cuenta de usuario está deshabilitada.',
        WEAK_PASSWORD: 'La contraseña no cumple los requisitos de seguridad.',
      };
      return new Error((firebaseCode && messages[firebaseCode]) || fallbackMessage);
    }

    return error instanceof Error ? error : new Error(fallbackMessage);
  }
}
