import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';

import { PurchaseService } from '../../services/purchase.service';
import { USER_SERVICE } from '../../services/user.service';
import { PurchaseCancelComponent } from './purchase-cancel';

describe('PurchaseCancelComponent', () => {
  let fixture: ComponentFixture<PurchaseCancelComponent>;
  let cancelPurchase: ReturnType<typeof vi.fn>;

  it('no modifica la compra antes de confirmar la cancelación', async () => {
    await createComponent(of(true));

    expect(cancelPurchase).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Conservar compra');
  });

  it('cancela la compra al confirmar y muestra el resultado', async () => {
    await createComponent(of(true));

    clickConfirmation();

    expect(cancelPurchase).toHaveBeenCalledWith('transaction-1', 'julia@example.com');
    expect(fixture.nativeElement.textContent).toContain('La entrada se ha cancelado correctamente');
  });

  it('muestra un error 404 si la compra no existe', async () => {
    await createComponent(of(false));

    clickConfirmation();

    expect(fixture.nativeElement.textContent).toContain('error 404');
  });

  it('bloquea la cancelación cuando no existe una sesión de usuario', async () => {
    await createComponent(of(true), 'transaction-1', null);

    const confirmButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);
    expect(cancelPurchase).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Debes iniciar sesión para cancelar esta compra.',
    );
  });

  it('rechaza una referencia vacía sin consultar el servicio', async () => {
    await createComponent(of(true), '   ');

    expect(cancelPurchase).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('error 404');
  });

  it('evita cancelaciones duplicadas mientras la operación está en curso', async () => {
    const pendingCancellation = new Subject<boolean>();
    await createComponent(pendingCancellation);

    clickConfirmation();
    clickConfirmation();

    expect(cancelPurchase).toHaveBeenCalledTimes(1);
    const confirmButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    pendingCancellation.next(true);
    pendingCancellation.complete();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('La entrada se ha cancelado correctamente');
  });

  it('muestra un mensaje comprensible si falla la cancelación', async () => {
    await createComponent(throwError(() => new Error('No se puede cancelar temporalmente.')));

    clickConfirmation();

    expect(fixture.nativeElement.textContent).toContain('No se puede cancelar temporalmente.');
  });

  async function createComponent(
    cancellationResponse: Observable<boolean>,
    purchaseId = 'transaction-1',
    userEmail: string | null = 'julia@example.com',
  ): Promise<void> {
    TestBed.resetTestingModule();
    cancelPurchase = vi.fn().mockReturnValue(cancellationResponse);

    await TestBed.configureTestingModule({
      imports: [PurchaseCancelComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ purchaseId })) },
        },
        {
          provide: PurchaseService,
          useValue: { cancelPurchase },
        },
        {
          provide: USER_SERVICE,
          useValue: {
            getCurrentUser: () =>
              of(
                userEmail === null
                  ? null
                  : {
                      id: 'firebase-user-id',
                      displayName: 'Julia Adell',
                      email: userEmail,
                    },
              ),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseCancelComponent);
    fixture.detectChanges();
    fixture.detectChanges();
  }

  function clickConfirmation(): void {
    const confirmButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    confirmButton.click();
    fixture.detectChanges();
  }
});
