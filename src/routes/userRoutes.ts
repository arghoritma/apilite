import { Router } from 'ultimate-express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Auth routes
router.post('/register', UserController.register);
router.post('/login', UserController.login as any);
// Protected routes
router.get('/profile', authMiddleware, UserController.getProfile as any);
export default router;