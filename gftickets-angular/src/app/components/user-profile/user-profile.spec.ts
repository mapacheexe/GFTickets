import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { Usuario } from '../../models/usuario.model';
import { USER_SERVICE } from '../../services/user.service';
import { UserProfileComponent } from './user-profile';

describe('UserProfileComponent', () => {
  const user: Usuario = {
    id: 1,
    nombre: 'Julia',
    apellidos: 'Adell Pérez',
    email: 'julia@example.com',
    nombreUsuario: 'julia.adell',
  };

  it('muestra todos los datos públicos del usuario', async () => {
    const fixture = await createComponent(of(user));
    const content = fixture.nativeElement.textContent as string;

    expect(content).toContain('Julia Adell Pérez');
    expect(content).toContain('julia@example.com');
    expect(content).toContain('julia.adell');
  });

  it('ofrece crear una cuenta cuando no existe un usuario actual', async () => {
    const fixture = await createComponent(of(null));

    expect(fixture.nativeElement.textContent).toContain('Todavía no hay datos de usuario');
    expect(fixture.nativeElement.querySelector('a')?.getAttribute('href')).toBe('/registro');
  });

  it('muestra un error y permite reintentar cuando falla la consulta', async () => {
    const fixture = await createComponent(throwError(() => new Error('fallo')));

    expect(fixture.nativeElement.textContent).toContain('No se han podido cargar tus datos.');
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Reintentar');
  });

  async function createComponent(
    response: Observable<Usuario | null>,
  ): Promise<ComponentFixture<UserProfileComponent>> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        provideRouter([]),
        {
          provide: USER_SERVICE,
          useValue: { getCurrentUser: vi.fn().mockReturnValue(response), registerUser: vi.fn() },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(UserProfileComponent);
    fixture.detectChanges();
    return fixture;
  }
});
