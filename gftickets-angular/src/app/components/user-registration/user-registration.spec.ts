import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { Usuario } from '../../models/usuario.model';
import { USER_SERVICE } from '../../services/user.service';
import { UserRegistrationComponent } from './user-registration';

describe('UserRegistrationComponent', () => {
  let fixture: ComponentFixture<UserRegistrationComponent>;
  let registerUser: ReturnType<typeof vi.fn>;

  const user: Usuario = {
    id: 'firebase-user-id',
    displayName: 'Julia María Adell Pérez',
    email: 'julia@example.com',
  };

  beforeEach(async () => {
    registerUser = vi.fn().mockReturnValue(of(user));
    await TestBed.configureTestingModule({
      imports: [UserRegistrationComponent],
      providers: [
        provideRouter([]),
        { provide: USER_SERVICE, useValue: { registerUser, getCurrentUser: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UserRegistrationComponent);
    fixture.detectChanges();
  });

  it('muestra los cuatro campos obligatorios del registro', () => {
    const requiredFields = fixture.nativeElement.querySelectorAll('input[required]');

    expect(requiredFields).toHaveLength(4);
    expect(Array.from(requiredFields).map((field) => (field as HTMLInputElement).id)).toEqual([
      'displayName',
      'email',
      'password',
      'passwordConfirmation',
    ]);
  });

  it('no envía un formulario vacío y muestra sus validaciones', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(registerUser).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Introduce tu nombre completo.');
  });

  it.each([
    'displayName',
    'email',
    'password',
    'passwordConfirmation',
  ] as const)('no envía el formulario cuando falta el campo obligatorio %s', (field) => {
    setValidValues();
    fixture.componentInstance['form'].controls[field].setValue('');
    submitForm();

    expect(registerUser).not.toHaveBeenCalled();
  });

  it('no permite registrar contraseñas diferentes', () => {
    setValidValues();
    fixture.componentInstance['form'].controls.passwordConfirmation.setValue('otraClave');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(registerUser).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Las contraseñas no coinciden.');
  });

  it('no permite registrar un usuario con un correo electrónico inválido', () => {
    setValidValues();
    fixture.componentInstance['form'].controls.email.setValue('correo-invalido');
    submitForm();

    expect(registerUser).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Introduce un correo electrónico válido.');
  });

  it('llama al servicio al introducir datos válidos', () => {
    setValidValues();
    submitForm();

    expect(registerUser).toHaveBeenCalledOnce();
  });

  it('envía al servicio los datos introducidos sin la confirmación de contraseña', () => {
    setValidValues();
    submitForm();

    expect(registerUser).toHaveBeenCalledWith({
      displayName: 'Julia María Adell Pérez',
      email: 'julia@example.com',
      password: 'segura123',
    });
  });

  it('muestra la confirmación después de un registro satisfactorio', () => {
    setValidValues();
    submitForm();

    expect(fixture.nativeElement.textContent).toContain('Cuenta creada correctamente.');
  });

  it('muestra el error devuelto por el servicio', () => {
    registerUser.mockReturnValue(throwError(() => new Error('El correo ya está registrado.')));
    setValidValues();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El correo ya está registrado.');
  });

  it('muestra un mensaje genérico cuando el servicio devuelve un error desconocido', () => {
    registerUser.mockReturnValue(throwError(() => ({ status: 500 })));
    setValidValues();
    submitForm();

    expect(fixture.nativeElement.textContent).toContain(
      'No se ha podido crear la cuenta. Inténtalo de nuevo.',
    );
  });

  it('deshabilita el botón y evita registros duplicados mientras procesa la petición', () => {
    const pendingRegistration = new Subject<Usuario>();
    registerUser.mockReturnValue(pendingRegistration);
    setValidValues();
    submitForm();

    const submitButton = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    submitForm();
    expect(registerUser).toHaveBeenCalledTimes(1);

    pendingRegistration.next(user);
    pendingRegistration.complete();
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(false);
  });

  function setValidValues(): void {
    fixture.componentInstance['form'].setValue({
      displayName: 'Julia María Adell Pérez',
      email: 'julia@example.com',
      password: 'segura123',
      passwordConfirmation: 'segura123',
    });
  }

  function submitForm(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }
});
