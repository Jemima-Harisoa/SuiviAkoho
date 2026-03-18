import { Router } from 'express';
import * as historiqueController from '../controllers/historique-incubation.controller';

const router = Router();

// GET
router.get('/', historiqueController.getAllHistoriqueIncubation);
router.get('/incubation/:incubationId', historiqueController.getHistoriqueIncubationByIncubation);
router.get('/date-range', historiqueController.getHistoriqueIncubationByDateRange);
router.get('/:id', historiqueController.getHistoriqueIncubationById);

// POST
router.post('/create', historiqueController.createHistoriqueIncubation);

// PUT
router.put('/:id', historiqueController.updateHistoriqueIncubation);

// DELETE
router.delete('/:id', historiqueController.deleteHistoriqueIncubation);

export default router;
