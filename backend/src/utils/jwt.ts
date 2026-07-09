import jwt from 'jsonwebtoken';
export function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}
export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as { userId: string };
}
