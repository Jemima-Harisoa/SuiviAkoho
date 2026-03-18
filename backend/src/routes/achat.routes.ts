import { Router } from 'express';
import * as achatController from '../controllers/achat.controller';

const router = Router();

router.get('/', achatController.getAllAchats);
router.get('/depenses', achatController.getDepenses);
router.post('/', achatController.createAchat);

export default router;
