import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookService } from '../services/book-service.js';
import type { IBookRepository } from '../interfaces/book-repository.interface.js';
import type Book from '../models/book.js';

const makeBook = (overrides = {}): Book =>
  ({
    id: 'book-uuid-1',
    title: 'Clean Code',
    author: 'Robert Martin',
    isbn: '978-0132350884',
    available: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }) as unknown as Book;

const makeRepo = (): IBookRepository => ({
  findByIsbn: vi.fn(),
  findById: vi.fn(),
  findAllPaginated: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

describe('BookService', () => {
  let repo: IBookRepository;
  let service: BookService;

  beforeEach(() => {
    repo = makeRepo();
    service = new BookService(repo);
  });

  describe('create', () => {
    it('throws 409 if ISBN already exists', async () => {
      vi.mocked(repo.findByIsbn).mockResolvedValue(makeBook());

      await expect(service.create({ title: 'T', author: 'A', isbn: '978-0132350884' }))
        .rejects.toMatchObject({ status: 409 });
    });

    it('creates book and returns BookDto', async () => {
      vi.mocked(repo.findByIsbn).mockResolvedValue(null);
      vi.mocked(repo.create).mockResolvedValue(makeBook());

      const result = await service.create({ title: 'Clean Code', author: 'Robert Martin', isbn: '978-0132350884' });

      expect(result.id).toBe('book-uuid-1');
      expect(result.title).toBe('Clean Code');
      expect(result.available).toBe(true);
    });
  });

  describe('findAll', () => {
    it('uses page=1 and size=10 by default', async () => {
      vi.mocked(repo.findAllPaginated).mockResolvedValue({ rows: [], count: 0 });

      await service.findAll({});

      expect(repo.findAllPaginated).toHaveBeenCalledWith(expect.objectContaining({ page: 1, size: 10 }));
    });

    it('returns paginated response with correct metadata', async () => {
      vi.mocked(repo.findAllPaginated).mockResolvedValue({ rows: [makeBook()], count: 1 });

      const result = await service.findAll({ page: 1, size: 5 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination?.total).toBe(1);
      expect(result.pagination?.totalPages).toBe(1);
    });
  });

  describe('findById', () => {
    it('throws 404 if book not found', async () => {
      vi.mocked(repo.findById).mockResolvedValue(null);

      await expect(service.findById('missing-uuid'))
        .rejects.toMatchObject({ status: 404 });
    });

    it('returns BookDto on success', async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeBook());

      const result = await service.findById('book-uuid-1');

      expect(result.id).toBe('book-uuid-1');
      expect(result.isbn).toBe('978-0132350884');
    });
  });

  describe('update', () => {
    it('throws 409 if ISBN belongs to a different book', async () => {
      vi.mocked(repo.findByIsbn).mockResolvedValue(makeBook({ id: 'other-uuid' }));

      await expect(service.update('book-uuid-1', { isbn: '978-0132350884' }))
        .rejects.toMatchObject({ status: 409 });
    });

    it('does not throw if ISBN belongs to the same book', async () => {
      vi.mocked(repo.findByIsbn).mockResolvedValue(makeBook({ id: 'book-uuid-1' }));
      vi.mocked(repo.update).mockResolvedValue(makeBook());

      await expect(service.update('book-uuid-1', { isbn: '978-0132350884' }))
        .resolves.toBeDefined();
    });

    it('throws 404 if book not found after update', async () => {
      vi.mocked(repo.findByIsbn).mockResolvedValue(null);
      vi.mocked(repo.update).mockResolvedValue(null);

      await expect(service.update('missing-uuid', { title: 'New Title' }))
        .rejects.toMatchObject({ status: 404 });
    });

    it('returns updated BookDto on success', async () => {
      vi.mocked(repo.findByIsbn).mockResolvedValue(null);
      vi.mocked(repo.update).mockResolvedValue(makeBook({ title: 'Updated' }));

      const result = await service.update('book-uuid-1', { title: 'Updated' });

      expect(result.title).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('throws 404 if book not found', async () => {
      vi.mocked(repo.delete).mockResolvedValue(false);

      await expect(service.delete('missing-uuid'))
        .rejects.toMatchObject({ status: 404 });
    });

    it('resolves without error on success', async () => {
      vi.mocked(repo.delete).mockResolvedValue(true);

      await expect(service.delete('book-uuid-1')).resolves.toBeUndefined();
    });
  });
});
