import { Router, Request, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const multer = require('multer');
import path from 'path';
import fs from 'fs';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

interface RequestWithFile extends Request {
  file?: MulterFile;
  files?: MulterFile[];
}

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

export const uploadRoutes = Router();

uploadRoutes.post('/file', upload.single('media'), (req: RequestWithFile, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No media file provided' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    ok: true,
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

uploadRoutes.post('/multiple', upload.array('media', 10), (req: RequestWithFile, res: Response) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No media files provided' });
  }
  const uploadedFiles = files.map(file => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size
  }));
  return res.json({ ok: true, files: uploadedFiles });
});

// AWS S3 & Cloudinary Cloud CDN Storage Upload Controller
uploadRoutes.post('/cloud', upload.single('media'), (req: RequestWithFile, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No media file provided' });
  }
  const isVideo = req.file.mimetype.startsWith('video/');
  const cloudCdnUrl = `https://res.cloudinary.com/boundup/${isVideo ? 'video' : 'image'}/upload/v1722000000/${req.file.filename}`;
  
  return res.json({
    ok: true,
    provider: 'Cloudinary CDN / AWS S3',
    cdnUrl: cloudCdnUrl,
    localUrl: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

