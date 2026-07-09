import { Request, Response } from 'express';
import { Anime } from '../models/Anime';
export async function listAnime(req: Request, res: Response) {
  const q = String(req.query.q || '');
  const filter = q ? { $text: { $search: q } } : {};
  const anime = await Anime.find(filter).sort({ rating: -1, createdAt: -1 }).limit(60);
  res.json({ anime });
}
export async function getAnime(req: Request, res: Response) {
  const anime = await Anime.findById(req.params.id);
  if (!anime) return res.status(404).json({ message: 'Anime not found' });
  res.json({ anime });
}
export async function createAnime(req: Request, res: Response) {
  const anime = await Anime.create(req.body);
  res.status(201).json({ anime });
}
