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
  };

  let getCurrentUser: ReturnType<typeof vi.fn>;

  it('solicita al servicio la información del usuario autenticado al acceder', async () => {
    await createComponent(of(user));

    expect(getCurrentUser).toHaveBeenCalledOnce();
  });

  it('muestra correctamente todos los datos recibidos', async () => {
    const fixture = await createComponent(of(user));
    const content = fixture.nativeElement.textContent as string;

    expect(content).toContain('Julia María Adell Pérez');
    expect(content).toContain('julia@example.com');
    expect(fixture.nativeElement.querySelector('.avatar')?.textContent.trim())
      .toBe('JP');
  });

  it('muestra la información correspondiente al usuario autenticado', async () => {
    const fixture = await createComponent(of(user));

    expect(fixture.nativeElement.textContent)
      .toContain(user.displayName);

    expect(fixture.nativeElement.textContent)
      .toContain(user.email);
  });

  it('muestra el indicador de carga mientras espera los datos', async () => {
    const pendingUser = new Subject<Usuario | null>();
    const fixture = await createComponent(pendingUser);

    expect(fixture.nativeElement.textContent)
      .toContain('Cargando tus datos');

    expect(
      fixture.nativeElement.querySelector('[role="status"]'),
    ).not.toBeNull();
  });

  it('bloquea el acceso a datos personales cuando no existe una sesión activa', async () => {
    const fixture = await createComponent(of(null));

    expect(fixture.nativeElement.textContent)
      .toContain('Todavía no hay datos de usuario');

    expect(
      fixture.nativeElement.querySelector('a')?.getAttribute('href'),
    ).toBe('/inicio-sesion');

    expect(fixture.nativeElement.textContent)
      .not.toContain('julia@example.com');
  });

  it('muestra un error y permite reintentar cuando falla la consulta', async () => {
    const fixture = await createComponent(
      throwError(() => new Error('fallo')),
    );

    expect(fixture.nativeElement.textContent)
      .toContain('No se han podido cargar tus datos.');

    expect(getButton(fixture, 'Reintentar'))
      .toBeDefined();
  });

  it('actualiza la vista cuando el servicio emite nuevos datos del usuario', async () => {
    const userUpdates = new Subject<Usuario | null>();
    const fixture = await createComponent(userUpdates);

    userUpdates.next(user);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain('Julia María Adell Pérez');

    userUpdates.next({
      ...user,
      displayName: 'Julia María de los Ángeles Adell Pérez',
      email: 'julia.maria@example.com',
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain('Julia María de los Ángeles Adell Pérez');

    expect(fixture.nativeElement.textContent)
      .toContain('julia.maria@example.com');

    expect(fixture.nativeElement.textContent)
      .not.toContain('julia@example.com');
  });

  it('permite cerrar sesión y elimina la información del usuario', async () => {
    const fixture = await createComponent(of(user));

    getButton(fixture, 'Cerrar sesión')?.click();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain('Todavía no hay datos de usuario');
  });


  it('muestra el botón para editar el nombre', async () => {
    const fixture = await createComponent(of(user));

    expect(getButton(fixture, 'Editar nombre'))
      .toBeDefined();
  });


  it('abre el formulario de edición del nombre', async () => {
    const fixture = await createComponent(of(user));

    getButton(fixture, 'Editar nombre')?.click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;

    expect(input).not.toBeNull();
    expect(input.value)
      .toBe(user.displayName);
  });


  it('cancela la edición del nombre', async () => {
    const fixture = await createComponent(of(user));

    getButton(fixture, 'Editar nombre')?.click();
    fixture.detectChanges();

    getButton(fixture, 'Cancelar')?.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('input'),
    ).toBeNull();

    expect(fixture.nativeElement.textContent)
      .toContain(user.displayName);
  });


  it('actualiza el nombre usando el servicio', async () => {
    const updatedUser: Usuario = {
      ...user,
      displayName: 'Julia Actualizada Pérez',
    };

    const updateDisplayName = vi.fn()
      .mockReturnValue(of(updatedUser));

    const fixture = await createComponent(
      of(user),
      {
        updateDisplayName,
      },
    );

    getButton(fixture, 'Editar nombre')?.click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;

    input.value = 'Julia Actualizada Pérez';
    input.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    getButton(fixture, 'Guardar')?.click();
    fixture.detectChanges();

    expect(updateDisplayName)
      .toHaveBeenCalledWith('Julia Actualizada Pérez');

    expect(fixture.nativeElement.textContent)
      .toContain('Julia Actualizada Pérez');
  });


  it('muestra error cuando falla la actualización del nombre', async () => {
    const updateDisplayName = vi.fn()
      .mockReturnValue(
        throwError(() => new Error('fallo')),
      );

    const fixture = await createComponent(
      of(user),
      {
        updateDisplayName,
      },
    );

    getButton(fixture, 'Editar nombre')?.click();
    fixture.detectChanges();

    getButton(fixture, 'Guardar')?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain('No se pudo actualizar el nombre.');
  });


  function getButton(
    fixture: ComponentFixture<UserProfileComponent>,
    text: string,
  ): HTMLButtonElement | undefined {
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];

    return buttons.find((button) =>
      button.textContent?.includes(text),
    );
  }


  async function createComponent(
    response: Observable<Usuario | null>,
    extraService: Record<string, unknown> = {},
  ): Promise<ComponentFixture<UserProfileComponent>> {
    TestBed.resetTestingModule();

    getCurrentUser = vi.fn()
      .mockReturnValue(response);

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        provideRouter([]),
        {
          provide: USER_SERVICE,
          useValue: {
            getCurrentUser,
            registerUser: vi.fn(),
            updateDisplayName: vi.fn(),
            ...extraService,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserProfileComponent);

    fixture.detectChanges();

    return fixture;
  }
});