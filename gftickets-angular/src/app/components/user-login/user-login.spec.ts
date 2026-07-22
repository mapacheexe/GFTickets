import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { UserLogin } from './user-login';
import { FirebaseUserService } from '../../services/firebase-user.service';

describe('UserLogin', () => {
  let component: UserLogin;
  let fixture: ComponentFixture<UserLogin>;
  let firebaseUserServiceMock: {
    loginUser: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  const authenticatedUser = {
    id: 'firebase-user-id',
    displayName: 'Julia María Adell Pérez',
    email: 'test@test.com',
  };

  beforeEach(async () => {

    firebaseUserServiceMock = {
      loginUser: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        UserLogin
      ],
      providers: [
        provideRouter([]),
        {
          provide: FirebaseUserService,
          useValue: firebaseUserServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserLogin);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });


  it('crea el componente', () => {
    expect(component).toBeTruthy();
  });


  it('marca el formulario como tocado al enviar datos inválidos', () => {

    component.login();

    expect(
      component.loginForm.controls.email.touched
    ).toBeTruthy();

    expect(
      component.loginForm.controls.password.touched
    ).toBeTruthy();

  });


  it('no llama al servicio cuando el formulario es inválido', () => {

    component.login();

    expect(
      firebaseUserServiceMock.loginUser
    ).not.toHaveBeenCalled();

  });


  it('llama al servicio de acceso con los valores del formulario', () => {

    firebaseUserServiceMock.loginUser.mockReturnValue(
      of(authenticatedUser)
    );

    component.loginForm.setValue({
      email: 'test@test.com',
      password: '123456'
    });

    component.login();

    expect(
      firebaseUserServiceMock.loginUser
    ).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '123456'
    });

  });


  it('redirige al inicio después de iniciar sesión', () => {

    firebaseUserServiceMock.loginUser.mockReturnValue(of(authenticatedUser));
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.loginForm.setValue({
      email: 'test@test.com',
      password: '123456'
    });

    component.login();

    expect(navigate).toHaveBeenCalledWith(['/']);
    expect(component.loading()).toBe(false);

  });


  it('muestra el mensaje cuando falla el inicio de sesión', () => {

    firebaseUserServiceMock.loginUser.mockReturnValue(
      throwError(() => new Error('El correo o la contraseña no son correctos.'))
    );

    component.loginForm.setValue({
      email: 'test@test.com',
      password: '123456'
    });

    component.login();

    expect(
      component.errorMessage()
    ).toBe('El correo o la contraseña no son correctos.');
    expect(component.loading()).toBe(false);

  });

});
