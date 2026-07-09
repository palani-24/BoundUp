import { Router } from 'express';
import { createAnime, getAnime, listAnime } from '../controllers/animeController';
import { auth } from '../middleware/auth';
export const animeRoutes = Router();
animeRoutes.get('/', listAnime);
animeRoutes.get('/:id', getAnime);
animeRoutes.post('/', auth, createAnime);
