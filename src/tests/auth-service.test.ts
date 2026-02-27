import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../services/auth-service.js';
import type { IUserRepository } from '../interfaces/user-repository.interface.js';
import type User from '../models/user.js';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock_token'),
  },
}));

const makeUser = (overrides = {}): User =>
  ({
    id: 'user-uuid-1',
    email: 'test@example.com',
    password: 'hashed_password',
    role: 'USER' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as User;

const makeRepo = (): IUserRepository => ({
  findByEmail: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
});

describe('AuthService', () => {
  let repo: IUserRepository;
  let service: AuthService;

  beforeEach(() => {
    repo = makeRepo();
    service = new AuthService(repo);
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('register', () => {
    it('throws 409 if email already exists', async () => {
      vi.mocked(repo.findByEmail).mockResolvedValue(makeUser());

      await expect(service.register({ email: 'test@example.com', password: 'pass' }))
        .rejects.toMatchObject({ status: 409 });
    });

    it('creates user and returns RegisterResult without token', async () => {
      vi.mocked(repo.findByEmail).mockResolvedValue(null);
      vi.mocked(repo.create).mockResolvedValue(makeUser());

      const result = await service.register({ email: 'test@example.com', password: 'pass' });

      expect(result).toEqual({ id: 'user-uuid-1', email: 'test@example.com', role: 'USER' });
      expect(result).not.toHaveProperty('token');
    });
  });

  describe('login', () => {
    it('throws 401 if user not found', async () => {
      vi.mocked(repo.findByEmail).mockResolvedValue(null);

      await expect(service.login({ email: 'x@x.com', password: 'pass' }))
        .rejects.toMatchObject({ status: 401 });
    });

    it('throws 401 if password is invalid', async () => {
      vi.mocked(repo.findByEmail).mockResolvedValue(makeUser());
      const bcrypt = (await import('bcrypt')).default;
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toMatchObject({ status: 401 });
    });

    it('returns AuthResult with token on success', async () => {
      vi.mocked(repo.findByEmail).mockResolvedValue(makeUser());
      const bcrypt = (await import('bcrypt')).default;
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({ email: 'test@example.com', password: 'pass' });

      expect(result.token).toBe('mock_token');
      expect(result.user).toEqual({ id: 'user-uuid-1', email: 'test@example.com', role: 'USER' });
    });
  });
});
