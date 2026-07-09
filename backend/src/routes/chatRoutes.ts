import { Router } from 'express';
import { auth } from '../middleware/auth';
import { createMessage, listMessages } from '../controllers/chatController';
export const chatRoutes = Router();
chatRoutes.get('/messages', auth, listMessages);
chatRoutes.post('/messages', auth, createMessage);
