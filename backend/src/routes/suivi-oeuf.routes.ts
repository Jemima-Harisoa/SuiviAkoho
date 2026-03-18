import { Router } from 'express';
import * as suiviOeufController from '../controllers/suivi-oeuf.controller';

const router = Router();

// GET
router.get('/', suiviOeufController.getAllSuiviOeuf);
router.get('/:id', suiviOeufController.getSuiviOeufById);
router.get('/lot/:lotId', suiviOeufController.getSuiviOeufByLot);
router.get('/lot/:lotId/week/:week', suiviOeufController.getSuiviOeufByLotAndWeek);

// POST
router.post('/create', suiviOeufController.createSuiviOeuf);

// PUT
router.put('/:id', suiviOeufController.updateSuiviOeuf);

// DELETE
router.delete('/:id', suiviOeufController.deleteSuiviOeuf);

export default router;
