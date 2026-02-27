import type { Application } from 'express';
import request from 'supertest';
import bcrypt from 'bcrypt';

export const truncateTables = async (): Promise<void> => {
  const { default: sequelize } = await import('../../config/database.js');
  await sequelize.query('TRUNCATE TABLE borrows, books, users RESTART IDENTITY CASCADE');
};

export const createAdminAndLogin = async (app: Application): Promise<string> => {
  const { default: User } = await import('../../models/User.js');
  const hashed = await bcrypt.hash('AdminTest123!', 10);
  await User.create({ email: 'admin@test.com', password: hashed, role: 'ADMIN' });
  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@test.com',
    password: 'AdminTest123!',
  });
  return res.body.data.token as string;
};

export const registerAndLogin = async (
  app: Application,
  email: string,
  password: string,
): Promise<string> => {
  await request(app).post('/api/v1/auth/register').send({ email, password });
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.body.data.token as string;
};
