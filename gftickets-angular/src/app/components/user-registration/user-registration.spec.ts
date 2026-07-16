import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

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

  it('no envía un formulario vacío y muestra sus validaciones', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(registerUser).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Introduce tu nombre.');
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
});
