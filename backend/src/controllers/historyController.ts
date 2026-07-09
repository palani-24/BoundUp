import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { History } from '../models/History';
export async function listHistory(req: AuthRequest, res: Response) {
  const history = await History.find({ user: req.userId }).sort({ watchedAt: -1 }).limit(100);
  res.json({ history });
}
export async function addHistory(req: AuthRequest, res: Response) {
  const item = await History.create({ user: req.userId, animeId: req.body.animeId });
  res.status(201).json({ item });
}
export async function clearHistory(req: AuthRequest, res: Response) {
  await History.deleteMany({ user: req.userId });
  res.json({ cleared: true });
}
