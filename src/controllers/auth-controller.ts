import type { Request, Response, NextFunction } from 'express';
import defaultAuthService from '../services/auth-service.js';
import type { IAuthService } from '../interfaces/auth-service.interface.js';
import { ApiResponse } from '../utils/api-response.js';

export class AuthController {
  private readonly authService: IAuthService;

  constructor(service: IAuthService = defaultAuthService) {
    this.authService = service;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
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
      res.status(201).json(ApiResponse.success(result, 'Inscription rÃ©ussie', 201));
    } catch (err) {
      next(err);
    }
  }
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const body = (req.body ?? {}) as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      res.status(400).json(ApiResponse.error('Email et mot de passe requis', 400));
      return;
    }

    try {
      const result = await this.authService.login({ email, password });
      res.status(200).json(ApiResponse.success(result, 'Connexion rÃ©ussie'));
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
