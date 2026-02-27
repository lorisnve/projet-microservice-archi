import type { BookDto, BookListQuery, CreateBookDto, UpdateBookDto } from '../types/index.js';
import type { ApiResponseBody } from '../utils/ApiResponse.js';

export interface IBookService {
  create(data: CreateBookDto): Promise<BookDto>;
  findAll(query: BookListQuery): Promise<ApiResponseBody<BookDto[]>>;
  findById(id: string): Promise<BookDto>;
  update(id: string, data: UpdateBookDto): Promise<BookDto>;
  delete(id: string): Promise<void>;
}
