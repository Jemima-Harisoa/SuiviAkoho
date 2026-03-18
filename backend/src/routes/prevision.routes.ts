import { Router } from 'express';
import * as previsionController from '../controllers/prevision.controller';

const router = Router();

router.get('/', previsionController.getAllPrevisions);
router.get('/budget', previsionController.getBudget);
router.post('/', previsionController.createPrevision);
router.put('/:id/realiser', previsionController.realiserPrevision);

export default router;
