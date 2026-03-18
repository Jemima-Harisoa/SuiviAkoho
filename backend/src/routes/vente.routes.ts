import { Router } from 'express';
import * as venteController from '../controllers/vente.controller';

const router = Router();

router.get('/', venteController.getAllVentes);
router.get('/ca', venteController.getChiffreAffaires);
router.post('/', venteController.createVente);

export default router;
