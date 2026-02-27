import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { truncateTables } from './integration/helpers.js';

describe('POST /api/v1/auth/register', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  it('returns 201 with user data (no token)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'user@test.com', password: 'Pass1234!' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ email: 'user@test.com', role: 'USER' });
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).not.toHaveProperty('token');
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('returns 400 if email or password is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'user@test.com' });

    expect(res.status).toBe(400);
  });

  it('returns 409 if email already exists', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'dup@test.com', password: 'Pass1234!' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'dup@test.com', password: 'Other1234!' });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    await truncateTables();
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'login@test.com', password: 'Pass1234!' });
  });

  it('returns 200 with token on success', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@test.com', password: 'Pass1234!' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toMatchObject({ email: 'login@test.com', role: 'USER' });
  });

  it('returns 401 if password is wrong', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@test.com', password: 'WrongPass!' });

    expect(res.status).toBe(401);
  });

  it('returns 401 if user does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.com', password: 'Pass1234!' });

    expect(res.status).toBe(401);
  });

  it('returns 400 if fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@test.com' });

    expect(res.status).toBe(400);
  });
});
