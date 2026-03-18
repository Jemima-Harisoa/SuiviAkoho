import { Router } from 'express';
import * as referenceCompositionAlimentController from '../controllers/reference-composition-aliment.controller';

const router = Router();

router.get('/', referenceCompositionAlimentController.getAllReferenceCompositionAliments);
router.get('/:id', referenceCompositionAlimentController.getReferenceCompositionAlimentById);
router.post('/create', referenceCompositionAlimentController.createReferenceCompositionAliment);

export default router;
