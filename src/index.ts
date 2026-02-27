import 'dotenv/config';
import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import authRoutes from './routes/AuthRoutes.js';
import monitoringRoutes from './routes/MonitoringRoutes.js';
import { httpRequestsTotal, httpRequestDurationSeconds } from './controllers/MonitoringController.js';
import bookRoutes from './routes/BookRoutes.js';
import './models/Borrow.js';
import { errorHandler } from './middlewares/ErrorHandler.js';
import { seedAdminUser } from './seeders/adminSeeder.js';

const app: Application = express();
const PORT = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());

// tracking des métriques Prometheus
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = { method: req.method, route: req.route?.path ?? req.path, status_code: String(res.statusCode) };
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, duration);
  });
  next();
});

// routes de monitoring (health + metrics)
app.use('/', monitoringRoutes);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);

app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');
    await sequelize.sync({ alter: true });
    console.log('Modèles synchronisés avec la base de données.');
    await seedAdminUser();
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur au démarrage :', error);
    process.exit(1);
  }
};

start();