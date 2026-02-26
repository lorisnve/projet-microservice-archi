import defaultBookRepository from '../repositories/BookRepository.js';
import type { IBookRepository } from '../interfaces/IBookRepository.js';
import type { IBookService } from '../interfaces/IBookService.js';
import type { BookDto, CreateBookDto } from '../types/index.js';

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
}

export default new BookService();
