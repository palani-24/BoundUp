import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Favorite } from '../models/Favorite';
export async function listFavorites(req: AuthRequest, res: Response) {
  const favorites = await Favorite.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ favorites });
}
export async function toggleFavorite(req: AuthRequest, res: Response) {
  const animeId = req.body.animeId;
  const existing = await Favorite.findOne({ user: req.userId, animeId });
  if (existing) { await existing.deleteOne(); return res.json({ favorited: false }); }
  await Favorite.create({ user: req.userId, animeId });
  res.json({ favorited: true });
}
