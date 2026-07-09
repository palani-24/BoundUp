import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
export interface AuthRequest extends Request { userId?: string }
export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  try { req.userId = verifyToken(header.slice(7)).userId; next(); }
  catch { return res.status(401).json({ message: 'Invalid token' }); }
}
