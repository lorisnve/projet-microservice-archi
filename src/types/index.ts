export type Role = 'USER' | 'ADMIN';

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    role: Role;
  };
  token: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
}

export interface BookDto {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookListQuery {
  page?: number;
  size?: number;
  title?: string;
  author?: string;
  available?: boolean;
}

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
