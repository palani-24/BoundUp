import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
export async function me(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId).select('-passwordHash');
  res.json({ user });
}
export async function updateSettings(req: AuthRequest, res: Response) {
  const user = await User.findByIdAndUpdate(req.userId, { $set: { settings: req.body } }, { new: true }).select('-passwordHash');
  res.json({ user });
}
