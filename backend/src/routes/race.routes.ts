import { Router } from "express";
import * as raceController from "../controllers/race.controllers";

const router = Router();

router.get('/', raceController.getAllRaces);
router.get('/:id', raceController.getRaceById);
router.post('/create', raceController.createRace);
router.get('/create'));


export default router;