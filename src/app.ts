import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth-routes.js';
import monitoringRoutes from './routes/monitoring-routes.js';
import { httpRequestsTotal, httpRequestDurationSeconds } from './controllers/monitoring-controller.js';
import bookRoutes from './routes/book-routes.js';
import './models/borrow.js';
import { errorHandler } from './middlewares/error-handler.js';

const app: Application = express();

app.use(cors());
app.use(express.json());

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

app.use('/', monitoringRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);

app.use(errorHandler);

export default app;
