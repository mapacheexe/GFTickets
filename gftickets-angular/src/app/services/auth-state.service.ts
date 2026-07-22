import { Injectable, InjectionToken, inject, signal } from '@angular/core';

import { UserStorage } from './user.service';

export const AUTH_SESSION_STORAGE_KEY = 'gftickets.firebase-session';

export const AUTH_SESSION_STORAGE = new InjectionToken<UserStorage>('AUTH_SESSION_STORAGE', {
  providedIn: 'root',
  factory: () => window.sessionStorage,
});

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly storage = inject(AUTH_SESSION_STORAGE);
  private readonly authenticated = signal(this.hasStoredSession());

  readonly isAuthenticated = this.authenticated.asReadonly();

  setAuthenticated(authenticated: boolean): void {
    this.authenticated.set(authenticated);
  }

  getIdToken(): string | null {
    const storedSession = this.storage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (storedSession === null) {
      return null;
    }

    try {
      const session = JSON.parse(storedSession) as { idToken?: unknown };
      return typeof session.idToken === 'string' && session.idToken.length > 0
        ? session.idToken
        : null;
    } catch {
      return null;
    }
  }

  private hasStoredSession(): boolean {
    return this.getIdToken() !== null;
  }
}
