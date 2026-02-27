import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { truncateTables, createAdminAndLogin, registerAndLogin } from './integration/helpers.js';

const UNKNOWN_UUID = '00000000-0000-0000-0000-000000000000';

const bookPayload = {
  title: 'The Pragmatic Programmer',
  author: 'David Thomas',
  isbn: '978-0201616224',
};

describe('Borrows API', () => {
  let adminToken: string;
  let userToken: string;
  let otherUserToken: string;
  let bookId: string;

  beforeAll(async () => {
    await truncateTables();
    adminToken = await createAdminAndLogin(app);
    userToken = await registerAndLogin(app, 'borrower@test.com', 'Pass1234!');
    otherUserToken = await registerAndLogin(app, 'other@test.com', 'Pass1234!');
  });

  beforeEach(async () => {
    const { default: sequelize } = await import('../config/database.js');
    await sequelize.query('TRUNCATE TABLE borrows, books RESTART IDENTITY CASCADE');

    const res = await request(app)
      .post('/api/v1/books')
      .set('Authorization', 'Bearer ' + adminToken)
      .send(bookPayload);

    bookId = res.body.data.id as string;
  });

  describe('POST /api/v1/books/:id/borrow', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/v1/books/' + bookId + '/borrow');
      expect(res.status).toBe(401);
    });

    it('returns 400 for invalid UUID', async () => {
      const res = await request(app)
        .post('/api/v1/books/not-a-uuid/borrow')
        .set('Authorization', 'Bearer ' + userToken);

      expect(res.status).toBe(400);
    });

    it('returns 404 for unknown book UUID', async () => {
      const res = await request(app)
        .post('/api/v1/books/' + UNKNOWN_UUID + '/borrow')
        .set('Authorization', 'Bearer ' + userToken);

      expect(res.status).toBe(404);
    });

    it('returns 201 and marks book unavailable', async () => {
      const res = await request(app)
        .post('/api/v1/books/' + bookId + '/borrow')
        .set('Authorization', 'Bearer ' + userToken);

      expect(res.status).toBe(201);
      expect(res.body.data.bookId).toBe(bookId);
      expect(res.body.data.returnedAt).toBeNull();

      const book = await request(app)
        .get('/api/v1/books/' + bookId)
        .set('Authorization', 'Bearer ' + userToken);

      expect(book.body.data.available).toBe(false);
    });

    it('returns 409 if book is already borrowed', async () => {
      await request(app)
        .post('/api/v1/books/' + bookId + '/borrow')
        .set('Authorization', 'Bearer ' + userToken);

      const res = await request(app)
        .post('/api/v1/books/' + bookId + '/borrow')
        .set('Authorization', 'Bearer ' + otherUserToken);

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/books/:id/return', () => {
    it('returns 409 if book is not borrowed', async () => {
      const res = await request(app)
        .post('/api/v1/books/' + bookId + '/return')
        .set('Authorization', 'Bearer ' + userToken);

      expect(res.status).toBe(409);
    });

    it('returns 403 if user is not the borrower', async () => {
      await request(app)
        .post('/api/v1/books/' + bookId + '/borrow')
        .set('Authorization', 'Bearer ' + userToken);

      const res = await request(app)
        .post('/api/v1/books/' + bookId + '/return')
        .set('Authorization', 'Bearer ' + otherUserToken);

      expect(res.status).toBe(403);
    });

    it('returns 200 with returnedAt set and marks book available', async () => {
      await request(app)
        .post('/api/v1/books/' + bookId + '/borrow')
        .set('Authorization', 'Bearer ' + userToken);

      const res = await request(app)
        .post('/api/v1/books/' + bookId + '/return')
        .set('Authorization', 'Bearer ' + userToken);

      expect(res.status).toBe(200);
      expect(res.body.data.returnedAt).not.toBeNull();

      const book = await request(app)
        .get('/api/v1/books/' + bookId)
        .set('Authorization', 'Bearer ' + userToken);

      expect(book.body.data.available).toBe(true);
    });
  });
});
