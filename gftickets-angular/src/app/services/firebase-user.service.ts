import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface FirebaseAuthResponse {
  kind: string;
  localId: string;
  email: string;
  displayName?: string;
  idToken: string;
  registered?: boolean;
  refreshToken: string;
  expiresIn: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseUserService {
  private readonly http = inject(HttpClient);

  private readonly apiKey = environment.firebase.apiKey;

  private readonly authUrl =
    'https://identitytoolkit.googleapis.com/v1';

  registerUser(data: RegisterRequest,): Observable<FirebaseAuthResponse> {
    return this.http.post<FirebaseAuthResponse>(
      `${this.authUrl}/accounts:signUp?key=${this.apiKey}`,
      {
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        returnSecureToken: true,
      },
    );
  }

  loginUser(data: RegisterRequest,): Observable<FirebaseAuthResponse> {
    return this.http.post<FirebaseAuthResponse>(
      `${this.authUrl}/accounts:signInWithPassword?key=${this.apiKey}`,
      {
        email: data.email,
        password: data.password,
        returnSecureToken: true,
      },
    );
  }
}