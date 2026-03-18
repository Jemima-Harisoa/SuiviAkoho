import { Router } from 'express';
import * as phaseAlimentationController from '../controllers/phase-alimentation.controller';

const router = Router();

router.get('/', phaseAlimentationController.getAllPhaseAlimentations);
router.get('/:id', phaseAlimentationController.getPhaseAlimentationById);
router.post('/create', phaseAlimentationController.createPhaseAlimentation);

export default router;
