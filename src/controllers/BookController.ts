import type { Request, Response, NextFunction } from 'express';
import defaultBookService from '../services/BookService.js';
import type { IBookService } from '../interfaces/IBookService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export class BookController {
  private readonly bookService: IBookService;

  constructor(service: IBookService = defaultBookService) {
    this.bookService = service;
    this.create = this.create.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findById = this.findById.bind(this);
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const body = (req.body ?? {}) as { title?: string; author?: string; isbn?: string };
    const { title, author, isbn } = body;

    if (!title || !author || !isbn) {
      res.status(400).json(ApiResponse.error('Les champs title, author et isbn sont requis', 400));
      return;
    }

    try {
      const result = await this.bookService.create({ title, author, isbn });
      res.status(201).json(ApiResponse.success(result, 'Livre créé avec succès', 201));
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { page, size, title, author, available } = req.query as Record<string, string | undefined>;

    try {
      const result = await this.bookService.findAll({
        page: page ? Number(page) : undefined,
        size: size ? Number(size) : undefined,
        title,
        author,
        available: available !== undefined ? available === 'true' : undefined,
      });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params as { id: string };
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      res.status(400).json(ApiResponse.error('Identifiant invalide : le format attendu est xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (UUID v4)', 400));
      return;
    }

    try {
      const result = await this.bookService.findById(id);
      res.status(200).json(ApiResponse.success(result, 'Livre trouvé'));
    } catch (err) {
      next(err);
    }
  }
}

export default new BookController();
