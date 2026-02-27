import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import defaultUserRepository from '../repositories/user-repository.js';
import type { IAuthService } from '../interfaces/auth-service.interface.js';
import type { IUserRepository } from '../interfaces/user-repository.interface.js';
import type { AuthResult, RegisterResult } from '../types/index.js';

const BCRYPT_ROUNDS = 10;
const JWT_EXPIRY = '1d';

export class AuthService implements IAuthService {
  private readonly userRepository: IUserRepository;

  constructor(userRepo: IUserRepository = defaultUserRepository) {
    this.userRepository = userRepo;
  }

  async register({ email, password }: { email: string; password: string }): Promise<RegisterResult> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw Object.assign(new Error('Cet email est dÃ©jÃ  utilisÃ©'), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.userRepository.create({ email, password: hashedPassword });

    return { id: user.id, email: user.email, role: user.role };
  }
  async login({ email, password }: { email: string; password: string }): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw Object.assign(new Error('Email ou mot de passe incorrect'), { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw Object.assign(new Error('Email ou mot de passe incorrect'), { status: 401 });
    }

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
