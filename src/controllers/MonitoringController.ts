import { type Request, type Response } from 'express';
import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import sequelize from '../config/database.js';

// ── Registre Prometheus ──

export const register = new Registry();

register.setDefaultLabels({ app: 'microservice-bibliotheque' });

collectDefaultMetrics({ register });

// ── Métriques perso ──

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP reçues',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// ── Controller ──

const monitoringController = {
  /**
   * GET /health
   * Health check public : vérifie la connectivité à la base de données.
   */
  health: async (_req: Request, res: Response): Promise<void> => {
    try {
      await sequelize.authenticate();

      res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'UP',
      });
    } catch {
      res.status(503).json({
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'DOWN',
      });
    }
  },

  /**
   * GET /metrics
   * Exposition des métriques au format Prometheus (text/plain; version=0.0.4).
   */
  metrics: async (_req: Request, res: Response): Promise<void> => {
    res.set('Content-Type', register.contentType);
    const output = await register.metrics();
    res.end(output);
  },
};

export default monitoringController;
