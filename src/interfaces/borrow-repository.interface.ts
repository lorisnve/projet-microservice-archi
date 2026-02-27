import type Borrow from '../models/borrow.js';

export interface IBorrowRepository {
  create(bookId: string, userId: string): Promise<Borrow>;
  findActiveByBookId(bookId: string): Promise<Borrow | null>;
  updateReturnDate(id: string): Promise<Borrow | null>;
}
