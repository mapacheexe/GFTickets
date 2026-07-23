import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, defer, map, of, switchMap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { RegistroUsuario, Usuario } from '../models/usuario.model';
import {
  AUTH_SESSION_STORAGE,
  AUTH_SESSION_STORAGE_KEY,
  AuthStateService,
} from './auth-state.service';
import { UserService } from './user.service';

export { AUTH_SESSION_STORAGE as FIREBASE_SESSION_STORAGE } from './auth-state.service';

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

@Injectable({ providedIn: 'root' })
export class FirebaseUserService implements UserService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(AUTH_SESSION_STORAGE);
  private readonly authState = inject(AuthStateService);
  private readonly apiKey = environment.firebase.apiKey;
  private readonly authUrl = 'https://identitytoolkit.googleapis.com/v1';

  registerUser(registration: RegistroUsuario): Observable<Usuario> {
    const displayName = registration.displayName.trim();

    return this.http
      .post<FirebaseAuthResponse>(`${this.authUrl}/accounts:signUp?key=${this.apiKey}`, {
        email: registration.email.trim(),
        password: registration.password,
        returnSecureToken: true,
      })
      .pipe(
        switchMap((signUpResponse) =>
          this.http
            .post<FirebaseAuthResponse>(`${this.authUrl}/accounts:update?key=${this.apiKey}`, {
              idToken: signUpResponse.idToken,
              displayName,
              returnSecureToken: true,
            })
            .pipe(
              map((profileResponse) => ({
                ...signUpResponse,
                ...profileResponse,
                email: profileResponse.email || signUpResponse.email,
                displayName: profileResponse.displayName || displayName,
              })),
            ),
        ),
        map((response) => {
          const user: Usuario = {
            id: response.localId,
            displayName,
            email: response.email,
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
          const previousUser = this.readSession()?.user;
          const hasMatchingStoredUser = previousUser?.id === response.localId;
          const user: Usuario = {
            id: response.localId,
            displayName: hasMatchingStoredUser
              ? previousUser.displayName
              : response.displayName?.trim() || '',
            email: response.email,
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

            const user: Usuario = {
              ...session.user,
              id: firebaseUser.localId,
              email: firebaseUser.email,
            };
            this.storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify({ ...session, user }));
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
    this.storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    this.authState.setAuthenticated(true);
  }

  private readSession(): FirebaseSession | null {
    const storedSession = this.storage.getItem(AUTH_SESSION_STORAGE_KEY);

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
    this.storage.removeItem(AUTH_SESSION_STORAGE_KEY);
    this.authState.setAuthenticated(false);
  }

  private toAuthenticationError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof HttpErrorResponse) {
      const firebaseMessage = (error.error as { error?: { message?: string } } | null)?.error
        ?.message;
      const firebaseCode = firebaseMessage?.split(' : ')[0];
      const messages: Readonly<Record<string, string>> = {
        EMAIL_EXISTS: 'El correo ya está registrado.',
        INVALID_EMAIL: 'El correo electrónico no es válido.',
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


  updateDisplayName(displayName: string): Observable<Usuario> {
    const session = this.readSession();

    if (!session) {
      return throwError(() => new Error('No hay una sesión activa.'));
    }

    return this.http
      .post<FirebaseAuthResponse>(
        `${this.authUrl}/accounts:update?key=${this.apiKey}`,
        {
          idToken: session.idToken,
          displayName: displayName.trim(),
          returnSecureToken: true,
        }
      )
      .pipe(
        map((response) => {
          const user: Usuario = {
            ...session.user,
            displayName: response.displayName ?? displayName.trim(),
          };

          this.saveSession(response, user);

          return user;
        }),
        catchError((error: unknown) =>
          throwError(() => this.toAuthenticationError(error, 'No se ha podido actualizar el perfil.'))
        )
      );
  }
}
