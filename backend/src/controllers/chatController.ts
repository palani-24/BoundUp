import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ChatMessage } from '../models/ChatMessage';
export async function listMessages(req: AuthRequest, res: Response) {
  const roomId = String(req.query.roomId || 'demo');
  const messages = await ChatMessage.find({ roomId }).sort({ createdAt: 1 }).limit(100);
  res.json({ messages });
}
export async function createMessage(req: AuthRequest, res: Response) {
  const msg = await ChatMessage.create({ roomId: req.body.roomId || 'demo', sender: req.userId, text: req.body.text, type: req.body.type || 'text' });
  req.app.get('io')?.to(msg.roomId).emit('message:new', msg);
  res.status(201).json({ message: msg });
}
