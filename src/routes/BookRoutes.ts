import { Router } from 'express';
import bookController from '../controllers/BookController.js';
import borrowController from '../controllers/BorrowController.js';
import { jwtAuth, requireRole } from '../middlewares/JwtAuthMiddleware.js';

const router = Router();

router.get('/', jwtAuth, bookController.findAll);
router.get('/:id', jwtAuth, bookController.findById);
router.post('/', jwtAuth, requireRole('ADMIN'), bookController.create);
router.put('/:id', jwtAuth, requireRole('ADMIN'), bookController.update);
router.delete('/:id', jwtAuth, requireRole('ADMIN'), bookController.delete);
router.post('/:id/borrow', jwtAuth, borrowController.borrow);
router.post('/:id/return', jwtAuth, borrowController.returnBook);

export default router;
