import './tracing.js';
import 'dotenv/config';
import sequelize from './config/database.js';
import app from './app.js';
import { seedAdminUser } from './seeders/admin-seeder.js';

const PORT = process.env.PORT ?? 8080;

const start = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await seedAdminUser();
    app.listen(PORT, () => {
      console.log('Serveur demarre sur le port ' + String(PORT));
    });
  } catch (error) {
    console.error('Erreur au demarrage :', error);
    process.exit(1);
  }
};

start();
