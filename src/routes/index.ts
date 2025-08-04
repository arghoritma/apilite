import userRoutes from './userRoutes';
import websocketRoutes from './websocketRoutes';
import { Router } from 'ultimate-express';

const router = Router();

router.use('/users', userRoutes);
router.use('/ws', websocketRoutes);

export default router;
