import type Book from '../models/Book.js';
import type { CreateBookDto } from '../types/index.js';

export interface IBookRepository {
  findById(id: string): Promise<Book | null>;
  findByIsbn(isbn: string): Promise<Book | null>;
  findAll(): Promise<Book[]>;
  create(data: CreateBookDto): Promise<Book>;
}
