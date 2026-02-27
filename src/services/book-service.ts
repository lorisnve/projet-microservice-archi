import defaultBookRepository from '../repositories/book-repository.js';
import type { IBookRepository } from '../interfaces/book-repository.interface.js';
import type { IBookService } from '../interfaces/book-service.interface.js';
import type { BookDto, BookListQuery, CreateBookDto, UpdateBookDto } from '../types/index.js';
import { ApiResponse } from '../utils/api-response.js';
import type { ApiResponseBody } from '../utils/api-response.js';

export class BookService implements IBookService {
  private readonly bookRepository: IBookRepository;

  constructor(bookRepo: IBookRepository = defaultBookRepository) {
    this.bookRepository = bookRepo;
  }

  async create(data: CreateBookDto): Promise<BookDto> {
    const existing = await this.bookRepository.findByIsbn(data.isbn);
    if (existing) {
      throw Object.assign(new Error('Un livre avec cet ISBN existe déjà'), { status: 409 });
    }

    const book = await this.bookRepository.create(data);

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      available: book.available,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }

  async findAll(query: BookListQuery): Promise<ApiResponseBody<BookDto[]>> {
    const page = Number(query.page ?? 1);
    const size = Number(query.size ?? 10);

    const { rows, count } = await this.bookRepository.findAllPaginated({ ...query, page, size });

    const data: BookDto[] = rows.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      available: book.available,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    }));

    return ApiResponse.paginated(data, {
      page,
      size,
      total: count,
      totalPages: Math.ceil(count / size),
    }, 'Liste des livres');
  }
  async findById(id: string): Promise<BookDto> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw Object.assign(new Error('Livre introuvable'), { status: 404 });
    }

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      available: book.available,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }

  async update(id: string, data: UpdateBookDto): Promise<BookDto> {
    if (data.isbn) {
      const existing = await this.bookRepository.findByIsbn(data.isbn);
      if (existing && existing.id !== id) {
        throw Object.assign(new Error('Un livre avec cet ISBN existe déjà'), { status: 409 });
      }
    }

    const book = await this.bookRepository.update(id, data);
    if (!book) {
      throw Object.assign(new Error('Livre introuvable'), { status: 404 });
    }

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      available: book.available,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.bookRepository.delete(id);
    if (!deleted) {
      throw Object.assign(new Error('Livre introuvable'), { status: 404 });
    }
  }
}

export default new BookService();
