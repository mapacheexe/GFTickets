import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { UserLogin } from './user-login';
import { FirebaseUserService } from '../../services/firebase-user.service';

describe('UserLogin', () => {
  let component: UserLogin;
  let fixture: ComponentFixture<UserLogin>;

  let firebaseUserServiceMock: {
    loginUser: ReturnType<typeof vi.fn>;
  };

  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: vi.fn((key: string) => store[key] ?? null),

      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),

      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),

      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();


  beforeEach(async () => {

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    });

    localStorageMock.clear();
    vi.clearAllMocks();

    firebaseUserServiceMock = {
      loginUser: vi.fn(),
    };


    await TestBed.configureTestingModule({
      imports: [
        UserLogin,
      ],
      providers: [
        provideRouter([]),
        {
          provide: FirebaseUserService,
          useValue: firebaseUserServiceMock,
        },
      ],
    }).compileComponents();


    fixture = TestBed.createComponent(UserLogin);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });


  it('debería marcar los campos como tocados al enviar un formulario inválido', () => {

    component.login();

    expect(
      component.loginForm.controls.email.touched
    ).toBeTruthy();

    expect(
      component.loginForm.controls.password.touched
    ).toBeTruthy();

  });


  it('no debería llamar al servicio cuando el formulario es inválido', () => {

    component.login();

    expect(
      firebaseUserServiceMock.loginUser
    ).not.toHaveBeenCalled();

  });


  it('debería llamar al servicio de login con los valores del formulario', () => {

    firebaseUserServiceMock.loginUser.mockReturnValue(
      of({
        idToken: 'token-test',
        email: 'test@test.com',
      })
    );

    component.loginForm.setValue({
      email: 'test@test.com',
      password: '123456',
    });

    component.login();

    expect(
      firebaseUserServiceMock.loginUser
    ).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '123456',
    });

  });


  it('debería guardar el token tras iniciar sesión correctamente', () => {

    firebaseUserServiceMock.loginUser.mockReturnValue(
      of({
        idToken: 'token-test',
        email: 'test@test.com',
      })
    );

    component.loginForm.setValue({
      email: 'test@test.com',
      password: '123456',
    });

    component.login();

    expect(
      localStorageMock.setItem
    ).toHaveBeenCalledWith(
      'token',
      'token-test',
    );

  });


  it('debería mostrar un mensaje de error cuando falla el inicio de sesión', () => {

    firebaseUserServiceMock.loginUser.mockReturnValue(
      throwError(() => ({
        error: {
          error: {
            message: 'EMAIL_NOT_FOUND',
          },
        },
      }))
    );

    component.loginForm.setValue({
      email: 'test@test.com',
      password: '123456',
    });

    component.login();

    expect(
      component.errorMessage
    ).toBe('EMAIL_NOT_FOUND');

  });

});