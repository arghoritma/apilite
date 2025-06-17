import { Router } from 'ultimate-express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/refresh-token', UserController.refreshToken);

// Protected routes
router.get('/profile', authMiddleware as any, UserController.getProfile as any);
router.get('/sessions', authMiddleware as any, UserController.getSessions as any);
router.post('/logout', authMiddleware as any, UserController.logout as any);
router.post('/logout-all', authMiddleware as any, UserController.logoutAllDevices as any);

export default router;