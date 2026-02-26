import { Router } from 'express';
import authController from '../controllers/AuthController.js';

const router: Router = Router();

router.post('/register', authController.register);

export default router;

