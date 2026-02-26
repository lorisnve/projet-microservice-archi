import { Op } from 'sequelize';
import Book from '../models/Book.js';
import type { IBookRepository } from '../interfaces/IBookRepository.js';
import type { BookListQuery, CreateBookDto } from '../types/index.js';

export class BookRepository implements IBookRepository {
  async findById(id: string): Promise<Book | null> {
    return Book.findByPk(id);
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return Book.findOne({ where: { isbn } });
  }

  async findAllPaginated(query: BookListQuery): Promise<{ rows: Book[]; count: number }> {
    const { page = 1, size = 10, title, author, available } = query;
    const where: Record<string, unknown> = {};

    if (title) where['title'] = { [Op.iLike]: `%${title}%` };
    if (author) where['author'] = { [Op.iLike]: `%${author}%` };
    if (available !== undefined) where['available'] = available;

    return Book.findAndCountAll({
      where,
      limit: size,
      offset: (page - 1) * size,
      order: [['createdAt', 'DESC']],
    });
  }

  async create(data: CreateBookDto): Promise<Book> {
    return Book.create(data);
  }
}

export default new BookRepository();
