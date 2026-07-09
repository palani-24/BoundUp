import { Router } from 'express';
import { getMobileBlueprint, trackMobileInterest } from '../controllers/mobileBlueprintController';

export const mobileBlueprintRoutes = Router();
mobileBlueprintRoutes.get('/blueprint', getMobileBlueprint);
mobileBlueprintRoutes.post('/interest', trackMobileInterest);
