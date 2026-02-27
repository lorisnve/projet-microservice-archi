import { defineConfig } from 'vitest/config';
import { config as loadDotenv } from 'dotenv';

const testEnv = loadDotenv({ path: '.env.test' }).parsed ?? {};

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.integration.test.ts'],
    env: testEnv as Record<string, string>,
    globalSetup: ['src/tests/integration/global-setup.ts'],
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});
