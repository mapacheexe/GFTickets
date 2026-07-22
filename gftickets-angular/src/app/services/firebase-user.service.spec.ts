import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { RegistroUsuario, Usuario } from '../models/usuario.model';
import {
  FIREBASE_SESSION_STORAGE,
  FirebaseAuthResponse,
  FirebaseUserService,
} from './firebase-user.service';
import { UserStorage } from './user.service';

describe('FirebaseUserService', () => {
  const registration: RegistroUsuario = {
    displayName: 'Julia María De la Cruz Pérez',
    email: 'julia@example.com',
    password: 'segura123',
  };
  const authResponse: FirebaseAuthResponse = {
    kind: 'identitytoolkit#SignupNewUserResponse',
    localId: 'firebase-user-id',
    email: registration.email,
    idToken: 'firebase-id-token',
    refreshToken: 'firebase-refresh-token',
    expiresIn: '3600',
  };
  const profileResponse: FirebaseAuthResponse = {
    ...authResponse,
    displayName: registration.displayName,
    idToken: 'firebase-profile-id-token',
    refreshToken: 'firebase-profile-refresh-token',
  };
  const user: Usuario = {
    id: authResponse.localId,
    displayName: registration.displayName,
    email: registration.email,
  };

  let service: FirebaseUserService;
  let http: HttpTestingController;
  let storedSession: string | null;
  let storage: UserStorage;

  beforeEach(() => {
    storedSession = null;
    storage = {
      getItem: vi.fn(() => storedSession),
      setItem: vi.fn((_key: string, value: string) => {
        storedSession = value;
      }),
      removeItem: vi.fn(() => {
        storedSession = null;
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        FirebaseUserService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FIREBASE_SESSION_STORAGE, useValue: storage },
      ],
    });
    service = TestBed.inject(FirebaseUserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('registra el usuario con su nombre completo y conserva los tokens solo en la sesión', async () => {
    const resultPromise = firstValueFrom(service.registerUser(registration));
    const request = http.expectOne(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebase.apiKey}`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: registration.email,
      password: registration.password,
      returnSecureToken: true,
    });
    request.flush(authResponse);

    const profileRequest = http.expectOne((candidate) => candidate.url.includes('accounts:update'));
    expect(profileRequest.request.method).toBe('POST');
    expect(profileRequest.request.body).toEqual({
      idToken: authResponse.idToken,
      displayName: registration.displayName,
      returnSecureToken: true,
    });
    profileRequest.flush(profileResponse);

    await expect(resultPromise).resolves.toEqual(user);
    expect(JSON.stringify(await resultPromise)).not.toContain('Token');
    expect(storedSession).toContain(profileResponse.idToken);
    expect(storedSession).toContain(profileResponse.refreshToken);
  });

  it('traduce el error de correo ya registrado', async () => {
    const resultPromise = firstValueFrom(service.registerUser(registration));
    const request = http.expectOne((candidate) => candidate.url.includes('accounts:signUp'));
    request.flush(
      { error: { message: 'EMAIL_EXISTS' } },
      { status: 400, statusText: 'Bad Request' },
    );

    await expect(resultPromise).rejects.toThrow('El correo ya está registrado.');
  });

  it('inicia sesión y devuelve únicamente el modelo público del usuario', async () => {
    const resultPromise = firstValueFrom(
      service.loginUser({ email: registration.email, password: registration.password }),
    );
    const request = http.expectOne((candidate) =>
      candidate.url.includes('accounts:signInWithPassword'),
    );
    expect(request.request.body).toEqual({
      email: registration.email,
      password: registration.password,
      returnSecureToken: true,
    });
    request.flush(profileResponse);

    await expect(resultPromise).resolves.toEqual(user);
    expect(JSON.stringify(await resultPromise)).not.toContain(authResponse.idToken);
  });

  it('informa si Firebase crea la cuenta pero no puede guardar el nombre completo', async () => {
    const resultPromise = firstValueFrom(service.registerUser(registration));
    http
      .expectOne((candidate) => candidate.url.includes('accounts:signUp'))
      .flush(authResponse);
    http
      .expectOne((candidate) => candidate.url.includes('accounts:update'))
      .flush({}, { status: 500, statusText: 'Internal Server Error' });

    await expect(resultPromise).rejects.toThrow('No se ha podido crear la cuenta.');
    expect(storedSession).toBeNull();
  });

  it('devuelve null sin consultar Firebase cuando no existe una sesión', async () => {
    await expect(firstValueFrom(service.getCurrentUser())).resolves.toBeNull();
    http.expectNone((request) => request.url.includes('accounts:lookup'));
  });

  it('recupera de Firebase los datos del usuario autenticado', async () => {
    setStoredSession();
    const resultPromise = firstValueFrom(service.getCurrentUser());
    const request = http.expectOne((candidate) => candidate.url.includes('accounts:lookup'));
    expect(request.request.body).toEqual({ idToken: authResponse.idToken });
    request.flush({
      users: [
        {
          localId: authResponse.localId,
          email: 'julia.actualizada@example.com',
          displayName: 'Nombre modificado fuera de la aplicación',
        },
      ],
    });

    await expect(resultPromise).resolves.toEqual({
      ...user,
      email: 'julia.actualizada@example.com',
    });
  });

  it('elimina una sesión local dañada', async () => {
    storedSession = '{sesion-invalida';

    await expect(firstValueFrom(service.getCurrentUser())).resolves.toBeNull();
    expect(storage.removeItem).toHaveBeenCalled();
  });

  it('elimina la sesión cuando Firebase rechaza el token', async () => {
    setStoredSession();
    const resultPromise = firstValueFrom(service.getCurrentUser());
    const request = http.expectOne((candidate) => candidate.url.includes('accounts:lookup'));
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    await expect(resultPromise).resolves.toBeNull();
    expect(storedSession).toBeNull();
  });

  it('propaga un mensaje comprensible si falla la consulta del perfil', async () => {
    setStoredSession();
    const resultPromise = firstValueFrom(service.getCurrentUser());
    const request = http.expectOne((candidate) => candidate.url.includes('accounts:lookup'));
    request.flush({}, { status: 500, statusText: 'Internal Server Error' });

    await expect(resultPromise).rejects.toThrow('No se han podido cargar los datos del usuario.');
  });

  function setStoredSession(): void {
    storedSession = JSON.stringify({
      idToken: authResponse.idToken,
      refreshToken: authResponse.refreshToken,
      user,
    });
  }
});
