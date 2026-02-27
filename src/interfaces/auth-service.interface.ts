import type { AuthResult, RegisterResult } from '../types/index.js';

export interface IAuthService {
  register(data: { email: string; password: string }): Promise<RegisterResult>;
  login(data: { email: string; password: string }): Promise<AuthResult>;
}
