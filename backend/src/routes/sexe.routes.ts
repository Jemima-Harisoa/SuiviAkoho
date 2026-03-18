import { Router } from 'express';
import * as sexeController from '../controllers/sexe.controller';

const router = Router();

router.get('/', sexeController.getAllSexes);
router.get('/:id', sexeController.getSexeById);
router.post('/create', sexeController.createSexe);

export default router;
