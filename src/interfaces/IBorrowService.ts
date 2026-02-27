import type { BorrowDto } from '../types/index.js';

export interface IBorrowService {
  borrow(bookId: string, userId: string): Promise<BorrowDto>;
}
