import { Router } from 'ultimate-express';
import UserController from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth';
import { validateInput } from '../middlewares/validation';
import { userValidation } from '../middlewares/validations/userValidation';

const router = Router();
// Public routes
router.post('/register', validateInput(userValidation.register), UserController.register);
router.post('/login', validateInput(userValidation.login), UserController.login);
router.post('/refresh-token', UserController.refreshToken);

// Protected routes
router.get('/profile', authMiddleware, UserController.getProfile);
router.get('/sessions', authMiddleware, UserController.getSessions);
router.post('/logout', authMiddleware, UserController.logout);
router.post('/logout-all', authMiddleware, UserController.logoutAllDevices);

export default router;