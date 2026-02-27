import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { truncateTables, createAdminAndLogin, registerAndLogin } from './integration/helpers.js';

const UNKNOWN_UUID = '00000000-0000-0000-0000-000000000000';
const INVALID_UUID = 'not-a-uuid';

const bookPayload = {
  title: 'Clean Code',
  author: 'Robert Martin',
  isbn: '978-0132350884',
};

describe('Books API', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await truncateTables();
    adminToken = await createAdminAndLogin(app);
    userToken = await registerAndLogin(app, 'user@books.test', 'Pass1234!');
  });

  beforeEach(async () => {
    const { default: sequelize } = await import('../config/database.js');
    await sequelize.query('TRUNCATE TABLE borrows, books RESTART IDENTITY CASCADE');
  });

  describe('GET /api/v1/books', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/books');
      expect(res.status).toBe(401);
    });

    it('returns 200 with pagination metadata', async () => {
      const res = await request(app)
        .get('/api/v1/books')
        .set('Authorization', 'Bearer ' + userToken);

      expect(res.status).toBe(200);
      expect(res.body.pagination).toMatchObject({ page: 1, size: 10 });
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/books', () => {
    it('returns 403 when called as USER', async () => {
      const res = await request(app)
        .post('/api/v1/books')
        .set('Authorization', 'Bearer ' + userToken)
        .send(bookPayload);

      expect(res.status).toBe(403);
    });

    it('returns 201 with BookDto when called as ADMIN', async () => {
      const res = await request(app)
        .post('/api/v1/books')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(bookPayload);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ title: 'Clean Code', isbn: '978-0132350884', available: true });
      expect(res.body.data).toHaveProperty('id');
    });

    it('returns 409 if ISBN already exists', async () => {
      await request(app)
        .post('/api/v1/books')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(bookPayload);

      const res = await request(app)
        .post('/api/v1/books')
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ ...bookPayload, title: 'Other Title' });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/v1/books/:id', () => {
    it('returns 400 for invalid UUID', async () => {
      const res = await request(app)
        .get('/api/v1/books/' + INVALID_UUID)
        .set('Authorization', 'Bearer ' + userToken);

      expect(res.status).toBe(400);
    });

    it('returns 404 for unknown UUID', async () => {
      const res = await request(app)
        .get('/api/v1/books/' + UNKNOWN_UUID)
        .set('Authorization', 'Bearer ' + userToken);

      expect(res.status).toBe(404);
    });

    it('returns 200 with BookDto', async () => {
      const created = await request(app)
        .post('/api/v1/books')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(bookPayload);

      const res = await request(app)
        .get('/api/v1/books/' + created.body.data.id)
        .set('Authorization', 'Bearer ' + userToken);

      expect(res.status).toBe(200);
      expect(res.body.data.isbn).toBe('978-0132350884');
    });
  });

  describe('PUT /api/v1/books/:id', () => {
    it('returns 200 and updates the book', async () => {
      const created = await request(app)
        .post('/api/v1/books')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(bookPayload);

      const res = await request(app)
        .put('/api/v1/books/' + created.body.data.id)
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ title: 'Updated', author: 'New Author', isbn: '978-0132350884', available: true });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
    });

    it('returns 409 if ISBN belongs to another book', async () => {
      const _b1 = await request(app)
        .post('/api/v1/books')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(bookPayload);

      const b2 = await request(app)
        .post('/api/v1/books')
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ title: 'Other', author: 'Other', isbn: '978-0000000000' });

      const res = await request(app)
        .put('/api/v1/books/' + b2.body.data.id)
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ title: 'Other', author: 'Other', isbn: '978-0132350884', available: true });

      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/v1/books/:id', () => {
    it('returns 404 for nonexistent book', async () => {
      const res = await request(app)
        .delete('/api/v1/books/' + UNKNOWN_UUID)
        .set('Authorization', 'Bearer ' + adminToken);

      expect(res.status).toBe(404);
    });

    it('returns 200 and deletes the book', async () => {
      const created = await request(app)
        .post('/api/v1/books')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(bookPayload);

      const res = await request(app)
        .delete('/api/v1/books/' + created.body.data.id)
        .set('Authorization', 'Bearer ' + adminToken);

      expect(res.status).toBe(200);
    });
  });
});
