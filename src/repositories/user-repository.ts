import User from '../models/user.js';
import type { IUserRepository } from '../interfaces/user-repository.interface.js';
import type { CreateUserDto } from '../types/index.js';

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return User.findByPk(id);
  }

  async create(data: CreateUserDto): Promise<User> {
    return User.create(data);
  }
}

export default new UserRepository();

