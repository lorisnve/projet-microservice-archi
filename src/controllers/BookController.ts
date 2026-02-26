import type { Request, Response, NextFunction } from 'express';
import defaultBookService from '../services/BookService.js';
import type { IBookService } from '../interfaces/IBookService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { log } from 'node:console';

export class BookController {
  private readonly bookService: IBookService;

  constructor(service: IBookService = defaultBookService) {
    this.bookService = service;
    this.create = this.create.bind(this);
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    
    log('BookController.create called with body:', req);
    const body = (req.body ?? {}) as { title?: string; author?: string; isbn?: string };
    const { title, author, isbn } = body;

    if (!title || !author || !isbn) {
      res.status(400).json(ApiResponse.error('Les champs titre, auteur et isbn sont requis', 400));
      return;
    }

    try {
      const result = await this.bookService.create({ title, author, isbn });
      res.status(201).json(ApiResponse.success(result, 'Livre créé avec succès', 201));
    } catch (err) {
      next(err);
    }
  }
}

export default new BookController();
