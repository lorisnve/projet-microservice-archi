import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload, Role } from '../types/index.js';
import { ApiResponse } from '../utils/api-response.js';

export const jwtAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) {
    res.status(401).json(ApiResponse.error('Token manquant ou invalide', 401));
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json(ApiResponse.error('Token invalide ou expirÃ©', 401));
  }
};

export const requireRole = (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json(ApiResponse.error('AccÃ¨s refusÃ© : droits insuffisants', 403));
      return;
    }
    next();
  };