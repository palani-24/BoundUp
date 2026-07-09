import { Router } from 'express';
import { downloadStats, trackDownload } from '../controllers/downloadController';
export const downloadRoutes = Router();
downloadRoutes.post('/track', trackDownload);
downloadRoutes.get('/stats', downloadStats);
