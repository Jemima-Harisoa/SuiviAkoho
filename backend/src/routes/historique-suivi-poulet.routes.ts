import { Router } from 'express';
import * as historiqueController from '../controllers/historique-suivi-poulet.controller';

const router = Router();

// GET
router.get('/', historiqueController.getAllHistoriqueSuiviPoulet);
router.get('/lot/:lotId', historiqueController.getHistoriqueSuiviPouletByLot);
router.get('/event/:eventType', historiqueController.getHistoriqueSuiviPouletByEventType);
router.get('/suivi/:suiviPouletId', historiqueController.getHistoriqueSuiviPouletBySuiviPoulet);
router.get('/date-range', historiqueController.getHistoriqueSuiviPouletByDateRange);
router.get('/:id', historiqueController.getHistoriqueSuiviPouletById);

// POST
router.post('/', historiqueController.createHistoriqueSuiviPoulet);
router.post('/create', historiqueController.createHistoriqueSuiviPoulet);

// PUT
router.put('/:id', historiqueController.updateHistoriqueSuiviPoulet);

// DELETE
router.delete('/:id', historiqueController.deleteHistoriqueSuiviPoulet);

export default router;
