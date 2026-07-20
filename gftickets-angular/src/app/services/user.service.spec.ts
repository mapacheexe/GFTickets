import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería registrar un usuario correctamente', () => {
    const userData = {
      email: 'test@email.com',
      password: 'password123',
      displayName: 'Test User',
    };

    const expectedResponse = {
      kind: 'identitytoolkit#SignupNewUserResponse',
      localId: 'abc123',
      email: 'test@email.com',
      displayName: 'Test User',
      idToken: 'fake-token',
      refreshToken: 'fake-refresh-token',
      expiresIn: '3600',
    };

    service.registerUser(userData).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const request = httpMock.expectOne((req) =>
      req.url.includes('/register'),
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(userData);

    request.flush(expectedResponse);
  });

  it('debería iniciar sesión correctamente', () => {
    const userData = {
      email: 'test@email.com',
      password: 'password123',
    };

    const expectedResponse = {
      kind: 'identitytoolkit#VerifyPasswordResponse',
      localId: 'abc123',
      email: 'test@email.com',
      displayName: '',
      idToken: 'fake-token',
      registered: true,
      refreshToken: 'fake-refresh-token',
      expiresIn: '3600',
    };

    service.loginUser(userData).subscribe((response) => {
      expect(response).toEqual(expectedResponse);
    });

    const request = httpMock.expectOne((req) =>
      req.url.includes('/login'),
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(userData);

    request.flush(expectedResponse);
  });
});