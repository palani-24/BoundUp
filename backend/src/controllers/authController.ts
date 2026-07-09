import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
export async function register(req: Request, res: Response) {
  const body = registerSchema.parse(req.body);
  const exists = await User.findOne({ email: body.email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await User.create({ name: body.name, email: body.email, passwordHash });
  res.status(201).json({ token: signToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
}
export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);
  const user = await User.findOne({ email: body.email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: signToken(user.id), user: { id: user.id, name: user.name, email: user.email, aura: user.aura } });
}
