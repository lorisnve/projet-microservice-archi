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
  }
);

export default sequelize;
