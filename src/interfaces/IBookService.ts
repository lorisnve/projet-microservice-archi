import type { BookDto, BookListQuery, CreateBookDto } from '../types/index.js';
import type { ApiResponseBody } from '../utils/ApiResponse.js';

export interface IBookService {
  create(data: CreateBookDto): Promise<BookDto>;
  findAll(query: BookListQuery): Promise<ApiResponseBody<BookDto[]>>;
}
