import { Router } from 'express';
import monitoringController from '../controllers/MonitoringController.js';

const router: Router = Router();

router.get('/health', monitoringController.health);
router.get('/metrics', monitoringController.metrics);

export default router;
