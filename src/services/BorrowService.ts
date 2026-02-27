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

  async returnBorrow(bookId: string, userId: string): Promise<BorrowDto> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw Object.assign(new Error('Livre introuvable'), { status: 404 });
    }

    if (book.available) {
      throw Object.assign(new Error('Ce livre n\'est pas actuellement emprunté'), { status: 409 });
    }

    const activeBorrow = await this.borrowRepository.findActiveByBookId(bookId);
    if (!activeBorrow) {
      throw Object.assign(new Error('Aucun emprunt actif trouvé pour ce livre'), { status: 404 });
    }

    if (activeBorrow.userId !== userId) {
      throw Object.assign(new Error('Vous ne pouvez retourner que vos propres emprunts'), { status: 403 });
    }

    const returned = await this.borrowRepository.updateReturnDate(activeBorrow.id);
    await this.bookRepository.update(bookId, { available: true });

    return {
      id: returned!.id,
      bookId: returned!.bookId,
      userId: returned!.userId,
      borrowedAt: returned!.borrowedAt,
      returnedAt: returned!.returnedAt,
    };
  }
}

export default new BorrowService();
