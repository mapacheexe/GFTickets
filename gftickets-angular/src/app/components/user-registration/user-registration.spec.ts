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
    id: 1,
    nombre: 'Julia',
    apellidos: 'Adell Pérez',
    email: 'julia@example.com',
    nombreUsuario: 'julia.adell',
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

  it('muestra los seis campos obligatorios del registro', () => {
    const requiredFields = fixture.nativeElement.querySelectorAll('input[required]');

    expect(requiredFields).toHaveLength(6);
    expect(Array.from(requiredFields).map((field) => (field as HTMLInputElement).id)).toEqual([
      'nombre',
      'apellidos',
      'email',
      'nombreUsuario',
      'password',
      'passwordConfirmation',
    ]);
  });

  it('no envía un formulario vacío y muestra sus validaciones', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(registerUser).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Introduce tu nombre.');
  });

  it.each([
    'nombre',
    'apellidos',
    'email',
    'nombreUsuario',
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

  it('registra un usuario válido sin enviar la confirmación de contraseña', () => {
    setValidValues();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(registerUser).toHaveBeenCalledWith({
      nombre: 'Julia',
      apellidos: 'Adell Pérez',
      email: 'julia@example.com',
      nombreUsuario: 'julia.adell',
      password: 'segura123',
    });
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
      nombre: 'Julia',
      apellidos: 'Adell Pérez',
      email: 'julia@example.com',
      nombreUsuario: 'julia.adell',
      password: 'segura123',
      passwordConfirmation: 'segura123',
    });
  }

  function submitForm(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }
});
