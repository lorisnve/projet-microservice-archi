import defaultBorrowRepository from '../repositories/BorrowRepository.js';
import defaultBookRepository from '../repositories/BookRepository.js';
import type { IBorrowRepository } from '../interfaces/IBorrowRepository.js';
import type { IBookRepository } from '../interfaces/IBookRepository.js';
import type { IBorrowService } from '../interfaces/IBorrowService.js';
import type { BorrowDto } from '../types/index.js';

export class BorrowService implements IBorrowService {
  private readonly borrowRepository: IBorrowRepository;
  private readonly bookRepository: IBookRepository;

  constructor(
    borrowRepo: IBorrowRepository = defaultBorrowRepository,
    bookRepo: IBookRepository = defaultBookRepository,
  ) {
    this.borrowRepository = borrowRepo;
    this.bookRepository = bookRepo;
  }

  async borrow(bookId: string, userId: string): Promise<BorrowDto> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw Object.assign(new Error('Livre introuvable'), { status: 404 });
    }

    if (!book.available) {
      throw Object.assign(new Error('Ce livre est déjà emprunté'), { status: 409 });
    }

    await this.bookRepository.update(bookId, { available: false });

    const borrow = await this.borrowRepository.create(bookId, userId);

    return {
      id: borrow.id,
      bookId: borrow.bookId,
      userId: borrow.userId,
      borrowedAt: borrow.borrowedAt,
      returnedAt: borrow.returnedAt,
    };
  }
}

export default new BorrowService();
