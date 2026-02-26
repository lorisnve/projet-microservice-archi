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

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
