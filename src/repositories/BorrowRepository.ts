import Borrow from '../models/Borrow.js';
import type { IBorrowRepository } from '../interfaces/IBorrowRepository.js';

export class BorrowRepository implements IBorrowRepository {
  async create(bookId: string, userId: string): Promise<Borrow> {
    return Borrow.create({ bookId, userId, borrowedAt: new Date() });
  }

  async findActiveByBookId(bookId: string): Promise<Borrow | null> {
    return Borrow.findOne({ where: { bookId, returnedAt: null } });
  }
}

export default new BorrowRepository();
