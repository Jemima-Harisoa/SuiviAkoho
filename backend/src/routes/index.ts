import { Router } from 'express';

// Routes de référence (données fixes)
import sexeRoutes from './sexe.routes';
import typeProductionRoutes from './type-production.routes';
import raceRoutes from './race.routes';
import phaseAlimentationRoutes from './phase-alimentation.routes';
import compositionAlimentRoutes from './reference-composition-aliment.routes';
import uniteRoutes from './unite.routes';
import parametreRoutes from './parametre.routes';

// Routes métier (données évolutives)
import lotRoutes from './lot.routes';
import suiviPouletRoutes from './suivi-poulet.routes';
import suiviOeufRoutes from './suivi-oeuf.routes';
import traitementOeufsRoutes from './traitement-oeufs.routes';
import incubationRoutes from './incubation.routes';

const router = Router();

// RÉFÉRENCE - Endpoints statiques
router.use('/api/sexes', sexeRoutes);
router.use('/api/type-productions', typeProductionRoutes);
router.use('/api/races', raceRoutes);
router.use('/api/phases-alimentation', phaseAlimentationRoutes);
router.use('/api/composition-aliments', compositionAlimentRoutes);
router.use('/api/unites', uniteRoutes);
router.use('/api/parametres', parametreRoutes);

// MÉTIER - Endpoints évolutifs
router.use('/api/lots', lotRoutes);
router.use('/api/suivi-poulet', suiviPouletRoutes);
router.use('/api/suivi-oeuf', suiviOeufRoutes);
router.use('/api/traitement-oeufs', traitementOeufsRoutes);
router.use('/api/incubations', incubationRoutes);

export default router;
