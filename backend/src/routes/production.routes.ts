import { Router } from 'express';
import * as productionController from '../controllers/production.controller';

const router = Router();

router.get('/stock', productionController.getProductionStock);
router.get('/valeur', productionController.getProductionValeur);
router.post('/', productionController.createProduction);
router.put('/:id', productionController.updateProduction);

export default router;
