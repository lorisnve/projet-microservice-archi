import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BorrowService } from '../services/BorrowService.js';
import type { IBorrowRepository } from '../interfaces/IBorrowRepository.js';
import type { IBookRepository } from '../interfaces/IBookRepository.js';
import type Book from '../models/Book.js';
import type Borrow from '../models/Borrow.js';

const makeBook = (overrides = {}): Book =>
  ({
    id: 'book-uuid-1',
    title: 'Clean Code',
    author: 'Robert Martin',
    isbn: '978-0132350884',
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as Book;

const makeBorrow = (overrides = {}): Borrow =>
  ({
    id: 'borrow-uuid-1',
    bookId: 'book-uuid-1',
    userId: 'user-uuid-1',
    borrowedAt: new Date('2024-01-01'),
    returnedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as Borrow;

const makeBookRepo = (): IBookRepository => ({
  findByIsbn: vi.fn(),
  findById: vi.fn(),
  findAllPaginated: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

const makeBorrowRepo = (): IBorrowRepository => ({
  create: vi.fn(),
  findActiveByBookId: vi.fn(),
  updateReturnDate: vi.fn(),
});

const noTx = async <T>(fn: () => Promise<T>) => fn();

describe('BorrowService', () => {
  let bookRepo: IBookRepository;
  let borrowRepo: IBorrowRepository;
  let service: BorrowService;

  beforeEach(() => {
    bookRepo = makeBookRepo();
    borrowRepo = makeBorrowRepo();
    service = new BorrowService(borrowRepo, bookRepo, noTx);
  });

  describe('borrow', () => {
    it('throws 404 if book not found', async () => {
      vi.mocked(bookRepo.findById).mockResolvedValue(null);

      await expect(service.borrow('book-uuid-1', 'user-uuid-1'))
        .rejects.toMatchObject({ status: 404 });
    });

    it('throws 409 if book is not available', async () => {
      vi.mocked(bookRepo.findById).mockResolvedValue(makeBook({ available: false }));

      await expect(service.borrow('book-uuid-1', 'user-uuid-1'))
        .rejects.toMatchObject({ status: 409 });
    });

    it('marks book unavailable and returns BorrowDto on success', async () => {
      vi.mocked(bookRepo.findById).mockResolvedValue(makeBook({ available: true }));
      vi.mocked(bookRepo.update).mockResolvedValue(makeBook({ available: false }));
      vi.mocked(borrowRepo.create).mockResolvedValue(makeBorrow());

      const result = await service.borrow('book-uuid-1', 'user-uuid-1');

      expect(bookRepo.update).toHaveBeenCalledWith('book-uuid-1', { available: false });
      expect(result.bookId).toBe('book-uuid-1');
      expect(result.userId).toBe('user-uuid-1');
      expect(result.returnedAt).toBeNull();
    });
  });

  describe('returnBorrow', () => {
    it('throws 404 if book not found', async () => {
      vi.mocked(bookRepo.findById).mockResolvedValue(null);

      await expect(service.returnBorrow('book-uuid-1', 'user-uuid-1'))
        .rejects.toMatchObject({ status: 404 });
    });

    it('throws 409 if book is already available (not borrowed)', async () => {
      vi.mocked(bookRepo.findById).mockResolvedValue(makeBook({ available: true }));

      await expect(service.returnBorrow('book-uuid-1', 'user-uuid-1'))
        .rejects.toMatchObject({ status: 409 });
    });

    it('throws 404 if no active borrow found', async () => {
      vi.mocked(bookRepo.findById).mockResolvedValue(makeBook({ available: false }));
      vi.mocked(borrowRepo.findActiveByBookId).mockResolvedValue(null);

      await expect(service.returnBorrow('book-uuid-1', 'user-uuid-1'))
        .rejects.toMatchObject({ status: 404 });
    });

    it('throws 403 if userId does not match borrower', async () => {
      vi.mocked(bookRepo.findById).mockResolvedValue(makeBook({ available: false }));
      vi.mocked(borrowRepo.findActiveByBookId).mockResolvedValue(makeBorrow({ userId: 'other-user' }));

      await expect(service.returnBorrow('book-uuid-1', 'user-uuid-1'))
        .rejects.toMatchObject({ status: 403 });
    });

    it('sets returnedAt, marks book available and returns BorrowDto', async () => {
      const returnedAt = new Date();
      vi.mocked(bookRepo.findById).mockResolvedValue(makeBook({ available: false }));
      vi.mocked(borrowRepo.findActiveByBookId).mockResolvedValue(makeBorrow({ userId: 'user-uuid-1' }));
      vi.mocked(borrowRepo.updateReturnDate).mockResolvedValue(makeBorrow({ returnedAt }));
      vi.mocked(bookRepo.update).mockResolvedValue(makeBook({ available: true }));

      const result = await service.returnBorrow('book-uuid-1', 'user-uuid-1');

      expect(bookRepo.update).toHaveBeenCalledWith('book-uuid-1', { available: true });
      expect(result.returnedAt).toBe(returnedAt);
    });
  });
});
