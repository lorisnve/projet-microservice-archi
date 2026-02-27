import type { Request, Response, NextFunction } from 'express';
import defaultBorrowService from '../services/borrow-service.js';
import type { IBorrowService } from '../interfaces/borrow-service.interface.js';
import { ApiResponse } from '../utils/api-response.js';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class BorrowController {
  private readonly borrowService: IBorrowService;

  constructor(service: IBorrowService = defaultBorrowService) {
    this.borrowService = service;
    this.borrow = this.borrow.bind(this);
    this.returnBook = this.returnBook.bind(this);
  }

  async borrow(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: bookId } = req.params as { id: string };

    if (!uuidRegex.test(bookId)) {
      res.status(400).json(ApiResponse.error('Identifiant invalide : le format attendu est xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (UUID v4)', 400));
      return;
    }

    const userId = req.user!.id;

    try {
      const result = await this.borrowService.borrow(bookId, userId);
      res.status(201).json(ApiResponse.success(result, 'Livre empruntÃ© avec succÃ¨s', 201));
    } catch (err) {
      next(err);
    }
  }

  async returnBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: bookId } = req.params as { id: string };

    if (!uuidRegex.test(bookId)) {
      res.status(400).json(ApiResponse.error('Identifiant invalide : le format attendu est xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (UUID v4)', 400));
      return;
    }

    const userId = req.user!.id;

    try {
      const result = await this.borrowService.returnBorrow(bookId, userId);
      res.status(200).json(ApiResponse.success(result, 'Livre retournÃ© avec succÃ¨s', 200));
    } catch (err) {
      next(err);
    }
  }
}

export default new BorrowController();
