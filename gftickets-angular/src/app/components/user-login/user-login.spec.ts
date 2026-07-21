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

    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should mark form as touched when submitting invalid form', () => {

    component.login();

    expect(
      component.loginForm.controls.email.touched
    ).toBeTruthy();

    expect(
      component.loginForm.controls.password.touched
    ).toBeTruthy();

  });


  it('should not call service when form is invalid', () => {

    component.login();

    expect(
      firebaseUserServiceMock.loginUser
    ).not.toHaveBeenCalled();

  });


  it('should call login service with form values', () => {

    firebaseUserServiceMock.loginUser.mockReturnValue(
      of({
        idToken: 'token-test',
        email: 'test@test.com'
      })
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


  it('should store token after successful login', () => {

    firebaseUserServiceMock.loginUser.mockReturnValue(
      of({
        idToken: 'token-test',
        email: 'test@test.com'
      })
    );

    component.loginForm.setValue({
      email: 'test@test.com',
      password: '123456'
    });

    component.login();

    expect(
      localStorage.getItem('token')
    ).toBe('token-test');

  });


  it('should show error message when login fails', () => {

    firebaseUserServiceMock.loginUser.mockReturnValue(
      throwError(() => ({
        error: {
          error: {
            message: 'EMAIL_NOT_FOUND'
          }
        }
      }))
    );

    component.loginForm.setValue({
      email: 'test@test.com',
      password: '123456'
    });

    component.login();

    expect(
      component.errorMessage
    ).toBe('EMAIL_NOT_FOUND');

  });

});