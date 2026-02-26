import type { AuthResult } from '../types/index.js';

export interface IAuthService {
  register(data: { email: string; password: string }): Promise<AuthResult>;
  login(data: { email: string; password: string }): Promise<AuthResult>;
}
