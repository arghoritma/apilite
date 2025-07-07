import { Router } from 'ultimate-express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/refresh-token', UserController.refreshToken);

// Protected routes
router.get('/profile', authMiddleware, UserController.getProfile);
router.get('/sessions', authMiddleware, UserController.getSessions);
router.post('/logout', authMiddleware, UserController.logout);
router.post('/logout-all', authMiddleware, UserController.logoutAllDevices);

export default router;