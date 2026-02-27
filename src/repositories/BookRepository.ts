import { Op } from 'sequelize';
import Book from '../models/Book.js';
import type { IBookRepository } from '../interfaces/IBookRepository.js';
import type { BookListQuery, CreateBookDto, UpdateBookDto } from '../types/index.js';

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

  async update(id: string, data: UpdateBookDto): Promise<Book | null> {
    const book = await Book.findByPk(id);
    if (!book) return null;
    return book.update(data);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await Book.destroy({ where: { id } });
    return deleted > 0;
  }
}

export default new BookRepository();
