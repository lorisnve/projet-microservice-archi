import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import defaultUserRepository from '../repositories/UserRepository.js';
import type { IAuthService } from '../interfaces/IAuthService.js';
import type { IUserRepository } from '../interfaces/IUserRepository.js';
import type { AuthResult } from '../types/index.js';

const BCRYPT_ROUNDS = 10;
const JWT_EXPIRY = '1d';

export class AuthService implements IAuthService {
  private readonly userRepository: IUserRepository;

  constructor(userRepo: IUserRepository = defaultUserRepository) {
    this.userRepository = userRepo;
  }

  async register({ email, password }: { email: string; password: string }): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      const error = Object.assign(new Error('Cet email est déjà utilisé'), { status: 409 });
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.userRepository.create({ email, password: hashedPassword });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: JWT_EXPIRY }
    );

    return {
      user: { id: user.id, email: user.email, role: user.role },
      token,
    };
  }
}

export default new AuthService();
