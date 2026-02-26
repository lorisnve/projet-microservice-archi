import 'dotenv/config';
import express, { type Application } from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import authRoutes from './routes/AuthRoutes.js';
import { errorHandler } from './middlewares/ErrorHandler.js';

const app: Application = express();
const PORT = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Error handler (doit être après les routes)
app.use(errorHandler);

// Start server
const start = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');
    await sequelize.sync({ alter: true });
    console.log('Modèles synchronisés avec la base de données.');
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur au démarrage :', error);
    process.exit(1);
  }
};

start();