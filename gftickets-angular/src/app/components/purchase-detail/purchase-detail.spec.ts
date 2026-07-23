import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { Transaction } from '../../models/transaction.model';
import { PurchaseService } from '../../services/purchase.service';
import { USER_SERVICE } from '../../services/user.service';
import { PurchaseDetailComponent } from './purchase-detail';

describe('PurchaseDetailComponent', () => {
  const transaction: Transaction = {
    id: 'transaction-1',
    userEmail: 'julia@example.com',
    createdAt: '2026-07-17T10:00:00.000Z',
    invoice: {
      eventId: 7,
      eventName: 'Festival de verano',
      eventDate: '2026-07-20',
      venueName: 'Parc del Fòrum',
      concept: '2 entradas para Festival de verano',
      ticketQuantity: 2,
      unitPrice: 17.5,
      totalAmount: 35,
    },
  };

  let fixture: ComponentFixture<PurchaseDetailComponent>;
  let getPurchaseById: ReturnType<typeof vi.fn>;

  it('muestra todos los datos de una compra existente', async () => {
    await createComponent(of(transaction));

    const content = fixture.nativeElement.textContent;
    const links = fixture.nativeElement.querySelectorAll(
      '.footer-actions a',
    ) as NodeListOf<HTMLAnchorElement>;
    expect(getPurchaseById).toHaveBeenCalledWith('transaction-1', 'julia@example.com');
    expect(content).toContain('Festival de verano');
    expect(content).toContain('transaction-1');
    expect(content).toContain('julia@example.com');
    expect(content).toContain('Parc del Fòrum');
    expect(content).toContain('2');
    expect(links[0].getAttribute('href')).toBe('/eventos/7');
    expect(links[1].getAttribute('href')).toBe('/entradas/transaction-1');
  });

  it('muestra un error 404 cuando la compra no existe', async () => {
    await createComponent(of(null));

    expect(fixture.nativeElement.textContent).toContain('error 404');
  });

  it('muestra un error 404 ante un identificador vacío sin consultar el servicio', async () => {
    await createComponent(of(transaction), '   ');

    expect(getPurchaseById).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('error 404');
  });

  it('bloquea el detalle cuando no existe un usuario autenticado', async () => {
    await createComponent(of(transaction), 'transaction-1', null);

    expect(getPurchaseById).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Debes iniciar sesión para consultar esta compra.',
    );
  });

  it('informa si no se pueden cargar los datos de la compra', async () => {
    await createComponent(throwError(() => new Error('storage error')));

    expect(fixture.nativeElement.textContent).toContain(
      'No se han podido cargar los datos de la compra.',
    );
  });

  async function createComponent(
    purchaseResponse: Observable<Transaction | null>,
    purchaseId = 'transaction-1',
    userEmail: string | null = 'julia@example.com',
  ): Promise<void> {
    TestBed.resetTestingModule();
    getPurchaseById = vi.fn().mockReturnValue(purchaseResponse);

    await TestBed.configureTestingModule({
      imports: [PurchaseDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ purchaseId })) },
        },
        {
          provide: PurchaseService,
          useValue: { getPurchaseById },
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

    fixture = TestBed.createComponent(PurchaseDetailComponent);
    fixture.detectChanges();
    fixture.detectChanges();
  }
});
