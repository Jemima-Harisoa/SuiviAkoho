import { Router } from 'express';
import * as historiqueController from '../controllers/historique-suivi-oeuf.controller';

const router = Router();

// GET
router.get('/', historiqueController.getAllHistoriqueSuiviOeuf);
router.get('/suivi/:suiviOeufId', historiqueController.getHistoriqueSuiviOeufBySuiviOeuf);
router.get('/date-range', historiqueController.getHistoriqueSuiviOeufByDateRange);
router.get('/:id', historiqueController.getHistoriqueSuiviOeufById);

// POST
router.post('/create', historiqueController.createHistoriqueSuiviOeuf);

// PUT
router.put('/:id', historiqueController.updateHistoriqueSuiviOeuf);

// DELETE
router.delete('/:id', historiqueController.deleteHistoriqueSuiviOeuf);

export default router;
