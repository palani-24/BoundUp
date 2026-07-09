import { Request, Response } from 'express';
import { Download } from '../models/Download';
export async function trackDownload(req: Request, res: Response) {
  const record = await Download.create({ file: req.body.file, platform: req.body.platform, ip: req.ip, userAgent: req.headers['user-agent'] });
  res.status(201).json({ tracked: true, id: record.id });
}
export async function downloadStats(_req: Request, res: Response) {
  const total = await Download.countDocuments();
  const byFile = await Download.aggregate([{ $group: { _id: '$file', count: { $sum: 1 } } }]);
  res.json({ total, byFile });
}
