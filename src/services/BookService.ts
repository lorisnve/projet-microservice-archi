import defaultBookRepository from '../repositories/BookRepository.js';
import type { IBookRepository } from '../interfaces/IBookRepository.js';
import type { IBookService } from '../interfaces/IBookService.js';
import type { BookDto, BookListQuery, CreateBookDto } from '../types/index.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import type { ApiResponseBody } from '../utils/ApiResponse.js';

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
}

export default new BookService();
