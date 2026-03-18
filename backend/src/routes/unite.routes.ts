import { Router } from 'express';
import * as uniteController from '../controllers/unite.controller';

const router = Router();

router.get('/', uniteController.getAllUnites);
router.get('/:id', uniteController.getUniteById);
router.post('/create', uniteController.createUnite);

export default router;
