import { Router } from 'express';
import * as parametreController from '../controllers/parametre.controller';

const router = Router();

router.get('/', parametreController.getAllParametres);
router.get('/:id', parametreController.getParametreById);
router.post('/create', parametreController.createParametre);

export default router;
