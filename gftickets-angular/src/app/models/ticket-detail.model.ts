import { Evento } from './evento.model';
import { Transaction } from './transaction.model';

export interface TicketDetail {
  transaction: Transaction;
  event: Evento;
}
