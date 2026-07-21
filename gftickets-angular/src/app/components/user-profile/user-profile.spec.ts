import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';

import { Usuario } from '../../models/usuario.model';
import { USER_SERVICE } from '../../services/user.service';
import { UserProfileComponent } from './user-profile';

describe('UserProfileComponent', () => {
  const user: Usuario = {
    id: 'firebase-user-id',
    displayName: 'Julia María Adell Pérez',
    email: 'julia@example.com',
    nombreUsuario: 'julia.adell',
  };
  let getCurrentUser: ReturnType<typeof vi.fn>;

  it('muestra todos los datos públicos del usuario', async () => {
    const fixture = await createComponent(of(user));
    const content = fixture.nativeElement.textContent as string;

    expect(content).toContain('Julia María Adell Pérez');
    expect(content).toContain('julia@example.com');
    expect(content).toContain('julia.adell');
    expect(fixture.nativeElement.querySelector('.avatar')?.textContent.trim()).toBe('JP');
    expect(getCurrentUser).toHaveBeenCalledOnce();
  });

  it('muestra el indicador de carga mientras espera los datos', async () => {
    const pendingUser = new Subject<Usuario | null>();
    const fixture = await createComponent(pendingUser);

    expect(fixture.nativeElement.textContent).toContain('Cargando tus datos');
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
  });

  it('ofrece crear una cuenta cuando no existe un usuario actual', async () => {
    const fixture = await createComponent(of(null));

    expect(fixture.nativeElement.textContent).toContain('Todavía no hay datos de usuario');
    expect(fixture.nativeElement.querySelector('a')?.getAttribute('href')).toBe('/registro');
    expect(fixture.nativeElement.textContent).not.toContain('julia@example.com');
  });

  it('muestra un error y permite reintentar cuando falla la consulta', async () => {
    const fixture = await createComponent(throwError(() => new Error('fallo')));

    expect(fixture.nativeElement.textContent).toContain('No se han podido cargar tus datos.');
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Reintentar');
  });

  it('actualiza la vista cuando el servicio emite nuevos datos del usuario', async () => {
    const userUpdates = new Subject<Usuario | null>();
    const fixture = await createComponent(userUpdates);

    userUpdates.next(user);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Julia María Adell Pérez');

    userUpdates.next({
      ...user,
      displayName: 'Julia María de los Ángeles Adell Pérez',
      email: 'julia.maria@example.com',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Julia María de los Ángeles Adell Pérez');
    expect(fixture.nativeElement.textContent).toContain('julia.maria@example.com');
    expect(fixture.nativeElement.textContent).not.toContain('julia@example.com');
  });

  async function createComponent(
    response: Observable<Usuario | null>,
  ): Promise<ComponentFixture<UserProfileComponent>> {
    TestBed.resetTestingModule();
    getCurrentUser = vi.fn().mockReturnValue(response);
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        provideRouter([]),
        {
          provide: USER_SERVICE,
          useValue: { getCurrentUser, registerUser: vi.fn() },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(UserProfileComponent);
    fixture.detectChanges();
    return fixture;
  }
});
