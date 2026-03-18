import { Router } from 'express';
import * as typeProductionController from '../controllers/type-production.controller';

const router = Router();

router.get('/', typeProductionController.getAllTypeProductions);
router.get('/:id', typeProductionController.getTypeProductionById);
router.post('/create', typeProductionController.createTypeProduction);

export default router;
