import type { Request, Response, NextFunction } from 'express';
import { ValidationError, UniqueConstraintError, DatabaseError } from 'sequelize';
import { ApiResponse } from '../utils/ApiResponse.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (err instanceof ValidationError) {
    const errors = err.errors.map((e) => e.message);
    return res.status(400).json(ApiResponse.error('Données invalides', 400, errors));
  }

  if (err instanceof UniqueConstraintError) {
    const errors = err.errors.map((e) => e.message);
    return res.status(409).json(ApiResponse.error('Cette valeur est déjà utilisée', 409, errors));
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json(ApiResponse.error('Erreur base de données', 500));
  }

  const status = (err as Error & { status?: number }).status ?? 500;
  return res.status(status).json(ApiResponse.error(err.message, status));
}
