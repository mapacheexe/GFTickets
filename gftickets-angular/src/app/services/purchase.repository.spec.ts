import { TestBed } from '@angular/core/testing';

import { Transaction } from '../models/transaction.model';
import { LocalPurchaseRepository, PURCHASE_STORAGE, PurchaseStorage } from './purchase.repository';

describe('LocalPurchaseRepository', () => {
  const transaction: Transaction = {
    id: 'transaction-1',
    userEmail: 'user@example.com',
    createdAt: '2026-07-17T10:00:00.000Z',
    invoice: {
      eventId: 7,
      eventName: 'Festival',
      eventDate: '2026-07-20',
      venueName: 'Parc del Fòrum',
      concept: '2 entradas para Festival',
      ticketQuantity: 2,
      unitPrice: 17.5,
      totalAmount: 35,
    },
  };

  let storedValue: string | null;
  let storage: PurchaseStorage;
  let repository: LocalPurchaseRepository;

  beforeEach(() => {
    storedValue = null;
    storage = {
      getItem: vi.fn(() => storedValue),
      setItem: vi.fn((_key: string, value: string) => (storedValue = value)),
      removeItem: vi.fn(() => (storedValue = null)),
    };
    TestBed.configureTestingModule({
      providers: [LocalPurchaseRepository, { provide: PURCHASE_STORAGE, useValue: storage }],
    });
    repository = TestBed.inject(LocalPurchaseRepository);
  });

  it('persiste y recupera las compras del usuario', () => {
    repository.save(transaction);

    expect(repository.findByUser(' USER@EXAMPLE.COM ')).toEqual([transaction]);
  });

  it('no devuelve las compras pertenecientes a otro usuario', () => {
    repository.save(transaction);

    expect(repository.findByUser('other@example.com')).toEqual([]);
  });

  it('elimina datos locales dañados y devuelve una lista vacía', () => {
    storedValue = '{invalid-json';

    expect(repository.findByUser('user@example.com')).toEqual([]);
    expect(storage.removeItem).toHaveBeenCalled();
  });
});
