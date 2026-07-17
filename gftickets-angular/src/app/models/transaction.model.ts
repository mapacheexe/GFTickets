import { Invoice } from './invoice.model';

export interface Transaction {
  id: string;
  userEmail: string;
  invoice: Invoice;
  createdAt: string;
}
