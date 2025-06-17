import userRoutes from './userRoutes';
import { Router } from 'ultimate-express';

const router = Router();

router.use('/users', userRoutes);

export default router;
