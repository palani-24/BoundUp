import { Request, Response } from 'express';
import { MusicPlay } from '../models/MusicPlay';

export async function trackMusicPlay(req: Request, res: Response) {
  const { trackId, title } = req.body;
  if (!trackId || !title) return res.status(400).json({ message: 'trackId and title are required' });
  const play = await MusicPlay.create({
    trackId,
    title,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  res.status(201).json({ ok: true, playId: play._id });
}

export async function musicStats(_req: Request, res: Response) {
  const totalPlays = await MusicPlay.countDocuments();
  const topTracks = await MusicPlay.aggregate([
    { $group: { _id: '$trackId', title: { $first: '$title' }, plays: { $sum: 1 } } },
    { $sort: { plays: -1 } },
    { $limit: 10 }
  ]);
  res.json({ totalPlays, topTracks });
}
