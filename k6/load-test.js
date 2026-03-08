import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ── Custom metrics ───────────────────────────────────────────────────────────
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration', true);
const bookListDuration = new Trend('book_list_duration', true);
const bookCreateDuration = new Trend('book_create_duration', true);
const borrowDuration = new Trend('borrow_duration', true);

// ── Configuration ────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
  stages: [
    { duration: '15s', target: 20 },   // ramp-up
    { duration: '1m', target: 50 },    // plateau
    { duration: '30s', target: 100 },  // spike
    { duration: '30s', target: 50 },   // back to normal
    { duration: '15s', target: 0 },    // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.05'],
  },
};

// ── Setup: create admin token + test data ────────────────────────────────────
export function setup() {
  // Login as admin
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({
      email: 'admin@library.com',
      password: 'Admin1234!',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, { 'admin login OK': (r) => r.status === 200 });

  const adminToken = loginRes.json('data.token');

  // Register a test user for normal operations
  const testEmail = `loadtest-${Date.now()}@test.com`;
  http.post(
    `${BASE_URL}/api/v1/auth/register`,
    JSON.stringify({
      email: testEmail,
      password: 'LoadTest123!',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  // Login as test user
  const userLoginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({
      email: testEmail,
      password: 'LoadTest123!',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const userToken = userLoginRes.json('data.token');

  // Create a few books for borrowing
  const bookIds = [];
  for (let i = 0; i < 5; i++) {
    const res = http.post(
      `${BASE_URL}/api/v1/books`,
      JSON.stringify({
        title: `K6 Load Test Book ${i}`,
        author: `Author ${i}`,
        isbn: `978-0-k6-${Date.now()}-${i}`,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    if (res.status === 201) {
      bookIds.push(res.json('data.id'));
    }
  }

  return { adminToken, userToken, bookIds };
}

// ── Main VU scenario ─────────────────────────────────────────────────────────
export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.userToken}`,
  };
  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.adminToken}`,
  };

  // ── Health check ───────────────────────────────────────────────────────────
  group('Health', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, { 'health OK': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  // ── Login flow ─────────────────────────────────────────────────────────────
  group('Auth - Login', () => {
    const res = http.post(
      `${BASE_URL}/api/v1/auth/login`,
      JSON.stringify({
        email: 'admin@library.com',
        password: 'Admin1234!',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(res, { 'login OK': (r) => r.status === 200 });
    loginDuration.add(res.timings.duration);
    errorRate.add(res.status !== 200);
  });

  // ── List books ─────────────────────────────────────────────────────────────
  group('Books - List', () => {
    const res = http.get(`${BASE_URL}/api/v1/books`, { headers });
    check(res, { 'list books OK': (r) => r.status === 200 });
    bookListDuration.add(res.timings.duration);
    errorRate.add(res.status !== 200);
  });

  // ── Get single book ────────────────────────────────────────────────────────
  if (data.bookIds.length > 0) {
    group('Books - Get by ID', () => {
      const bookId = data.bookIds[Math.floor(Math.random() * data.bookIds.length)];
      const res = http.get(`${BASE_URL}/api/v1/books/${bookId}`, { headers });
      check(res, { 'get book OK': (r) => r.status === 200 });
      errorRate.add(res.status !== 200);
    });
  }

  // ── Create book (admin) ────────────────────────────────────────────────────
  group('Books - Create', () => {
    const uniqueIsbn = `978-k6-${__VU}-${__ITER}-${Date.now()}`;
    const res = http.post(
      `${BASE_URL}/api/v1/books`,
      JSON.stringify({
        title: `Perf Test Book ${__VU}-${__ITER}`,
        author: 'K6 Author',
        isbn: uniqueIsbn,
      }),
      { headers: adminHeaders }
    );
    check(res, { 'create book OK': (r) => r.status === 201 });
    bookCreateDuration.add(res.timings.duration);
    errorRate.add(res.status !== 201);
  });

  // ── Borrow & Return ───────────────────────────────────────────────────────
  if (data.bookIds.length > 0) {
    group('Borrow - Borrow book', () => {
      const bookId = data.bookIds[Math.floor(Math.random() * data.bookIds.length)];
      const res = http.post(`${BASE_URL}/api/v1/books/${bookId}/borrow`, null, {
        headers,
      });
      borrowDuration.add(res.timings.duration);
      // May fail if already borrowed — that's expected under load
      errorRate.add(res.status >= 500);
    });

    group('Borrow - Return book', () => {
      const bookId = data.bookIds[Math.floor(Math.random() * data.bookIds.length)];
      const res = http.post(`${BASE_URL}/api/v1/books/${bookId}/return`, null, {
        headers,
      });
      errorRate.add(res.status >= 500);
    });
  }

  sleep(0.5);
}

// ── Teardown ─────────────────────────────────────────────────────────────────
export function teardown(data) {
  // Cleanup: delete load test books
  for (const bookId of data.bookIds) {
    http.del(`${BASE_URL}/api/v1/books/${bookId}`, null, {
      headers: {
        Authorization: `Bearer ${data.adminToken}`,
      },
    });
  }
}
