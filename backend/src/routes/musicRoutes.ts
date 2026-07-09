import { Router } from 'express';
import { musicStats, trackMusicPlay } from '../controllers/musicController';
export const musicRoutes = Router();
musicRoutes.post('/play', trackMusicPlay);
musicRoutes.get('/stats', musicStats);
