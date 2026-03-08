import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASS as string,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT as 'postgres',
    port: Number(process.env.DB_PORT),
    logging: false,
    pool: {
      max: 30,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;
