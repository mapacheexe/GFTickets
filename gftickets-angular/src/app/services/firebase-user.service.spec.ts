import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { FirebaseUserService } from './firebase-user.service';
import { environment } from '../../environments/environment';

describe('FirebaseUserService', () => {
  let service: FirebaseUserService;
  let httpMock: HttpTestingController;

  const mockAuthResponse = {
    kind: 'identitytoolkit#SignupNewUserResponse',
    localId: 'test-user-id',
    email: 'test@test.com',
    displayName: 'Test User',
    idToken: 'test-id-token',
    refreshToken: 'test-refresh-token',
    expiresIn: '3600',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FirebaseUserService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(FirebaseUserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });


  it('debería crear correctamente el servicio', () => {
    expect(service)
      .toBeTruthy();
  });


  it('debería registrar un usuario correctamente en Firebase', () => {
    const registerData = {
      email: 'test@test.com',
      password: 'password123',
      displayName: 'Test User',
    };

    service.registerUser(registerData)
      .subscribe(response => {
        expect(response.email)
          .toBe(registerData.email);

        expect(response.idToken)
          .toBe(mockAuthResponse.idToken);
      });

    const request = httpMock.expectOne(req =>
      req.url.includes('accounts:signUp'),
    );

    expect(request.request.method)
      .toBe('POST');

    expect(request.request.url)
      .toContain(environment.firebase.apiKey);

    expect(request.request.body)
      .toEqual({
        email: registerData.email,
        password: registerData.password,
        displayName: registerData.displayName,
        returnSecureToken: true,
      });

    request.flush(mockAuthResponse);
  });


  it('debería iniciar sesión correctamente con credenciales válidas', () => {
    const loginData = {
      email: 'test@test.com',
      password: 'password123',
    };

    service.loginUser(loginData)
      .subscribe(response => {
        expect(response.email)
          .toBe(loginData.email);

        expect(response.idToken)
          .toBe(mockAuthResponse.idToken);
      });

    const request = httpMock.expectOne(req =>
      req.url.includes('accounts:signInWithPassword'),
    );

    expect(request.request.method)
      .toBe('POST');

    expect(request.request.body)
      .toEqual({
        email: loginData.email,
        password: loginData.password,
        returnSecureToken: true,
      });

    request.flush(mockAuthResponse);
  });


  it('debería incluir la API key de Firebase en las peticiones', () => {
    service.loginUser({
      email: 'test@test.com',
      password: 'password123',
    })
    .subscribe();

    const request = httpMock.expectOne(req =>
      req.url.includes('accounts:signInWithPassword'),
    );

    expect(request.request.url)
      .toContain(environment.firebase.apiKey);

    request.flush(mockAuthResponse);
  });


  it('debería propagar el error cuando Firebase rechaza las credenciales', () => {
    service.loginUser({
      email: 'invalid@test.com',
      password: 'invalid-password',
    })
    .subscribe({
      next: () => {
        throw new Error(
          'La autenticación debería haber fallado',
        );
      },
      error: error => {
        expect(error.status)
          .toBe(400);
      },
    });

    const request = httpMock.expectOne(req =>
      req.url.includes('accounts:signInWithPassword'),
    );

    request.flush(
      {
        error: {
          message: 'INVALID_LOGIN_CREDENTIALS',
        },
      },
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );
  });


  it('debería propagar errores inesperados de Firebase', () => {
    service.registerUser({
      email: 'test@test.com',
      password: 'password123',
    })
    .subscribe({
      next: () => {
        throw new Error(
          'La petición debería haber fallado',
        );
      },
      error: error => {
        expect(error.status)
          .toBe(500);
      },
    });

    const request = httpMock.expectOne(req =>
      req.url.includes('accounts:signUp'),
    );

    request.flush(
      {},
      {
        status: 500,
        statusText: 'Internal Server Error',
      },
    );
  });
});