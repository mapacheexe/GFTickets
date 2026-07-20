import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Service } from '@angular/core';
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
  displayName: string;
  idToken: string;
  registered?: boolean;
  refreshToken: string;
  expiresIn: string;
}

@Service()
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  registerUser(data: RegisterRequest): Observable<FirebaseAuthResponse> {
    return this.http.post<FirebaseAuthResponse>(
      `${this.apiUrl}/register`,
      data,
    );
  }

  loginUser(data: RegisterRequest): Observable<FirebaseAuthResponse> {
    return this.http.post<FirebaseAuthResponse>(`${this.apiUrl}/login`, data);
  }
}