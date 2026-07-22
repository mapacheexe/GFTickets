import { TestBed } from '@angular/core/testing';

import {
  AUTH_SESSION_STORAGE,
  AUTH_SESSION_STORAGE_KEY,
  AuthStateService,
} from './auth-state.service';
import { UserStorage } from './user.service';

describe('AuthStateService', () => {
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
  });

  it('detecta una sesión almacenada con un token válido', () => {
    storedSession = JSON.stringify({ idToken: 'firebase-token' });
    const service = createService();

    expect(storage.getItem).toHaveBeenCalledWith(AUTH_SESSION_STORAGE_KEY);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('considera no autenticada una sesión inexistente o dañada', () => {
    const serviceWithoutSession = createService();
    expect(serviceWithoutSession.isAuthenticated()).toBe(false);

    TestBed.resetTestingModule();
    storedSession = '{sesion-dañada';
    const serviceWithDamagedSession = createService();
    expect(serviceWithDamagedSession.isAuthenticated()).toBe(false);
  });

  it('actualiza de forma reactiva el estado de autenticación', () => {
    const service = createService();

    service.setAuthenticated(true);
    expect(service.isAuthenticated()).toBe(true);

    service.setAuthenticated(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  function createService(): AuthStateService {
    TestBed.configureTestingModule({
      providers: [
        AuthStateService,
        { provide: AUTH_SESSION_STORAGE, useValue: storage },
      ],
    });
    return TestBed.inject(AuthStateService);
  }
});
