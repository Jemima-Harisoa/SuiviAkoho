import { Router } from 'express';
import * as suiviPouletController from '../controllers/suivi-poulet.controller';

const router = Router();

// GET
router.get('/', suiviPouletController.getAllSuiviPoulet);
router.get('/lot/:lotId', suiviPouletController.getSuiviPouletByLot);
router.get('/lot/:lotId/week/:week', suiviPouletController.getSuiviPouletByLotAndWeek);

// POST
router.post('/create', suiviPouletController.createSuiviPoulet);

// PUT
router.put('/:id', suiviPouletController.updateSuiviPoulet);

// DELETE
router.delete('/:id', suiviPouletController.deleteSuiviPoulet);

export default router;
