import { config as loadDotenv } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: join(__dirname, '../../../.env.test'), override: true });

export async function setup(): Promise<void> {
  const dbName = process.env.DB_NAME!;

  const client = new pg.Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'postgres',
  });

  await client.connect();
  const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (result.rows.length === 0) {
    await client.query('CREATE DATABASE "' + dbName + '"');
  }
  await client.end();

  const { default: sequelize } = await import('../../config/database.js');
  await import('../../models/user.js');
  await import('../../models/book.js');
  await import('../../models/borrow.js');
  await sequelize.sync({ force: true });
  await sequelize.close();
}
