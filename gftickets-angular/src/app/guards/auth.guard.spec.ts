import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';

import { AuthStateService } from '../services/auth-state.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authenticated: boolean;
  let router: Router;

  beforeEach(() => {
    authenticated = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthStateService,
          useValue: { isAuthenticated: () => authenticated },
        },
      ],
    });
    router = TestBed.inject(Router);
  });

  it('permite acceder a la compra cuando existe una sesión', () => {
    authenticated = true;

    expect(runGuard('/compra/7')).toBe(true);
  });

  it('redirige al inicio de sesión conservando la ruta de compra', () => {
    const result = runGuard('/compra/7') as UrlTree;

    expect(router.serializeUrl(result)).toBe('/inicio-sesion?returnUrl=%2Fcompra%2F7');
  });

  function runGuard(url: string): boolean | UrlTree {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    ) as boolean | UrlTree;
  }
});
