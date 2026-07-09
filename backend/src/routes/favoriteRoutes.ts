import { Router } from 'express';
import { auth } from '../middleware/auth';
import { listFavorites, toggleFavorite } from '../controllers/favoriteController';
export const favoriteRoutes = Router();
favoriteRoutes.get('/', auth, listFavorites);
favoriteRoutes.post('/toggle', auth, toggleFavorite);
