import type Book from '../models/Book.js';
import type { CreateBookDto, BookListQuery, UpdateBookDto } from '../types/index.js';

export interface IBookRepository {
  findById(id: string): Promise<Book | null>;
  findByIsbn(isbn: string): Promise<Book | null>;
  findAllPaginated(query: BookListQuery): Promise<{ rows: Book[]; count: number }>;
  create(data: CreateBookDto): Promise<Book>;
  update(id: string, data: UpdateBookDto): Promise<Book | null>;
}
