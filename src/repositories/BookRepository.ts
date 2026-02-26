import Book from '../models/Book.js';
import type { IBookRepository } from '../interfaces/IBookRepository.js';
import type { CreateBookDto } from '../types/index.js';

export class BookRepository implements IBookRepository {
  async findById(id: string): Promise<Book | null> {
    return Book.findByPk(id);
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return Book.findOne({ where: { isbn } });
  }

  async findAll(): Promise<Book[]> {
    return Book.findAll();
  }

  async create(data: CreateBookDto): Promise<Book> {
    return Book.create(data);
  }
}

export default new BookRepository();
