import { Router } from 'express';
import { auth } from '../middleware/auth';
import { me, updateSettings } from '../controllers/userController';
export const userRoutes = Router();
userRoutes.get('/me', auth, me);
userRoutes.put('/settings', auth, updateSettings);
