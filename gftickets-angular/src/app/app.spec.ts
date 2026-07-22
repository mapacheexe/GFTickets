import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('debería crear la aplicación', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('debería mostrar la marca GFTickets', async () => {
    const fixture = TestBed.createComponent(App);

    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('GFTickets');
  });

  it('debería devolver false cuando no existe un token de sesión', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.hasSessionToken()).toBe(false);
  });

  it('debería devolver true cuando existe un token de sesión', () => {
    sessionStorage.setItem('gftickets.firebase-session', 'token');

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.hasSessionToken()).toBe(true);
  });

  it('debería mostrar el enlace "Iniciar sesión" cuando no hay sesión', () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Iniciar sesión');
    expect(compiled.textContent).not.toContain('Mis datos');
  });

  it('debería mostrar el enlace "Mis datos" cuando hay una sesión iniciada', () => {
    sessionStorage.setItem('gftickets.firebase-session', 'token');

    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Mis datos');
    expect(compiled.textContent).not.toContain('Iniciar sesión');
  });
});