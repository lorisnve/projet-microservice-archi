import type User from '../models/user.js';
import type { CreateUserDto } from '../types/index.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
}
