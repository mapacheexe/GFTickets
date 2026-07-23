import { Injectable, InjectionToken, inject } from '@angular/core';

import { Transaction } from '../models/transaction.model';

export interface PurchaseRepository {
  save(transaction: Transaction): void;
  findByUser(userEmail: string): Transaction[];
  removeById(transactionId: string, userEmail: string): boolean;
  findById(transactionId: string, userEmail: string): Transaction | null;
}

export interface PurchaseStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const PURCHASE_STORAGE = new InjectionToken<PurchaseStorage>('PURCHASE_STORAGE', {
  providedIn: 'root',
  factory: () => window.localStorage,
});

@Injectable({ providedIn: 'root' })
export class LocalPurchaseRepository implements PurchaseRepository {
  private readonly storageKey = 'gftickets.purchase-transactions';
  private readonly storage = inject(PURCHASE_STORAGE);

  save(transaction: Transaction): void {
    const transactions = this.readTransactions();
    this.storage.setItem(this.storageKey, JSON.stringify([...transactions, transaction]));
  }

  findByUser(userEmail: string): Transaction[] {
    const normalizedEmail = userEmail.trim().toLowerCase();
    return this.readTransactions().filter(
      (transaction) => transaction.userEmail.toLowerCase() === normalizedEmail,
    );
  }

  removeById(transactionId: string, userEmail: string): boolean {
    const transactions = this.readTransactions();
    const normalizedId = transactionId.trim();
    const normalizedEmail = userEmail.trim().toLowerCase();
    const remainingTransactions = transactions.filter(
      (transaction) =>
        transaction.id !== normalizedId || transaction.userEmail.toLowerCase() !== normalizedEmail,
    );

    if (remainingTransactions.length === transactions.length) {
      return false;
    }

    this.storage.setItem(this.storageKey, JSON.stringify(remainingTransactions));
    return true;
  }

  findById(transactionId: string, userEmail: string): Transaction | null {
    const normalizedId = transactionId.trim();
    const normalizedEmail = userEmail.trim().toLowerCase();

    return (
      this.readTransactions().find(
        (transaction) =>
          transaction.id === normalizedId &&
          transaction.userEmail.toLowerCase() === normalizedEmail,
      ) ?? null
    );
  }

  private readTransactions(): Transaction[] {
    const storedTransactions = this.storage.getItem(this.storageKey);
    if (storedTransactions === null) {
      return [];
    }

    try {
      const parsedValue: unknown = JSON.parse(storedTransactions);
      if (!Array.isArray(parsedValue)) {
        throw new Error('Invalid purchase storage');
      }
      return parsedValue as Transaction[];
    } catch {
      this.storage.removeItem(this.storageKey);
      return [];
    }
  }
}
