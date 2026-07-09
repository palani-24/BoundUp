import { Router } from 'express';
import { auth } from '../middleware/auth';
import { addHistory, clearHistory, listHistory } from '../controllers/historyController';
export const historyRoutes = Router();
historyRoutes.get('/', auth, listHistory);
historyRoutes.post('/', auth, addHistory);
historyRoutes.delete('/', auth, clearHistory);
