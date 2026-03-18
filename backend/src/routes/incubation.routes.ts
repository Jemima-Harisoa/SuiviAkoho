import { Router } from 'express';
import * as incubationController from '../controllers/incubation.controller';

const router = Router();

// GET
router.get('/', incubationController.getAllIncubations);
router.get('/:id', incubationController.getIncubationById);
router.get('/lot/:lotId', incubationController.getIncubationByLot);
router.get('/range', incubationController.getIncubationByDateRange);

// POST
router.post('/create', incubationController.createIncubation);

// PUT
router.put('/:id', incubationController.updateIncubation);

// DELETE
router.delete('/:id', incubationController.deleteIncubation);

export default router;
