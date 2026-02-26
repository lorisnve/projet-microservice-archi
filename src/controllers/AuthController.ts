import type { Request, Response, NextFunction } from 'express';
import defaultAuthService from '../services/AuthService.js';
import type { IAuthService } from '../interfaces/IAuthService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export class AuthController {
  private readonly authService: IAuthService;

  constructor(service: IAuthService = defaultAuthService) {
    this.authService = service;
    this.register = this.register.bind(this);
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    const body = (req.body ?? {}) as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      res.status(400).json(ApiResponse.error('Email et mot de passe requis', 400));
      return;
    }

    try {
      const result = await this.authService.register({ email, password });
      res.status(201).json(ApiResponse.success(result, 'Inscription réussie', 201));
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
