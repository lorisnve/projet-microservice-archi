import type { BookDto, CreateBookDto } from '../types/index.js';

export interface IBookService {
  create(data: CreateBookDto): Promise<BookDto>;
}
