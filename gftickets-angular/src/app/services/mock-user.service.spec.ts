import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { RegistroUsuario } from '../models/usuario.model';
import { MockUserService, USER_STORAGE, UserStorage } from './mock-user.service';

describe('MockUserService', () => {
  let storedValue: string | null;
  let storage: UserStorage;

  const registro: RegistroUsuario = {
    nombre: 'Julia',
    apellidos: 'Adell Pérez',
    email: 'julia@example.com',
    nombreUsuario: 'julia.adell',
    password: 'segura123',
  };

  beforeEach(() => {
    storedValue = null;
    storage = {
      getItem: vi.fn(() => storedValue),
      setItem: vi.fn((_key: string, value: string) => {
        storedValue = value;
      }),
      removeItem: vi.fn(() => {
        storedValue = null;
      }),
    };
    TestBed.configureTestingModule({
      providers: [MockUserService, { provide: USER_STORAGE, useValue: storage }],
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('registra y recupera únicamente los datos públicos del usuario', async () => {
    const service = TestBed.inject(MockUserService);
    const user = await firstValueFrom(service.registerUser(registro));
    const currentUser = await firstValueFrom(service.getCurrentUser());

    expect(user.nombreUsuario).toBe('julia.adell');
    expect(currentUser).toEqual(user);
    expect(storedValue).not.toContain(registro.password);
  });

  it('genera el identificador del usuario en el frontend', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(12345);
    const service = TestBed.inject(MockUserService);

    await expect(firstValueFrom(service.registerUser(registro))).resolves.toEqual(
      expect.objectContaining({ id: 12345 }),
    );
  });

  it('rechaza un correo electrónico ya registrado', async () => {
    const service = TestBed.inject(MockUserService);
    await firstValueFrom(service.registerUser(registro));

    await expect(
      firstValueFrom(
        service.registerUser({
          ...registro,
          nombreUsuario: 'otro.usuario',
        }),
      ),
    ).rejects.toThrow('ya está registrado');
  });

  it('rechaza un nombre de usuario ya registrado', async () => {
    const service = TestBed.inject(MockUserService);
    await firstValueFrom(service.registerUser(registro));

    await expect(
      firstValueFrom(
        service.registerUser({
          ...registro,
          email: 'otro@example.com',
        }),
      ),
    ).rejects.toThrow('ya está registrado');
  });

  it('elimina datos locales dañados y devuelve null', async () => {
    storedValue = '{dato-invalido';
    const service = TestBed.inject(MockUserService);

    await expect(firstValueFrom(service.getCurrentUser())).resolves.toBeNull();
    expect(storedValue).toBeNull();
  });
});
