import { Router } from 'express';
import * as lotController from '../controllers/lot.controller';

const router = Router();

// GET
router.get('/', lotController.getAllLots);
router.get('/:id', lotController.getLotById);
router.get('/code/:code', lotController.getLotByCode);
router.get('/status/:status', lotController.getLotsByStatus);
router.get('/race/:raceId', lotController.getLotsByRace);

// POST
router.post('/create', lotController.createLot);

// PUT
router.put('/:id', lotController.updateLot);

// DELETE
router.delete('/:id', lotController.deleteLot);

// ACTIONS
router.post('/:id/close', lotController.closeLot);

export default router;
