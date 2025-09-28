import { Router } from 'ultimate-express';
import AuthController from '../controllers/AuthController'
import { authMiddleware } from '../middlewares/auth';
import { validateInput } from '../middlewares/validation';
import { userValidation } from '../middlewares/validations/userValidation';

const router = Router();
// Public routes
router.post('/register', validateInput(userValidation.register), AuthController.register);
router.post('/login', validateInput(userValidation.login), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes
router.get('/sessions', authMiddleware, AuthController.getSessions);
router.get('/logout', authMiddleware, AuthController.logout);
router.get('/logout-all', authMiddleware, AuthController.logoutAllDevices);

export default router;