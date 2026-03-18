import { Router } from 'express';
import * as traitementController from '../controllers/traitement-oeufs.controller';

const router = Router();

// GET
router.get('/', traitementController.getAllTraitement);
router.get('/lot/:sourceLotId', traitementController.getTraitementByLot);
router.get('/suivi/:suiviOeufId', traitementController.getTraitementBySuiviOeuf);
router.get('/type/:type', traitementController.getTraitementByType);

// POST
router.post('/create', traitementController.createTraitement);

// DELETE
router.delete('/:id', traitementController.deleteTraitement);

export default router;
