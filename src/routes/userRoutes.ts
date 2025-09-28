import { Router } from 'ultimate-express';
import UserController from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Protected routes
router.get('/profile', authMiddleware, UserController.getProfile);

export default router;