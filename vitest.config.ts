import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    exclude: ['src/tests/**/*.integration.test.ts'],
    env: {
      DB_NAME: 'test',
      DB_USER: 'test',
      DB_PASS: 'test',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_DIALECT: 'postgres',
      JWT_SECRET: 'unit_test_secret',
      ADMIN_EMAIL: 'admin@test.com',
      ADMIN_PASSWORD: 'Admin123!',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/services/**/*.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
