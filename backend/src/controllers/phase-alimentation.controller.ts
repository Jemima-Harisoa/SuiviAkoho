import { Request, Response } from 'express';
import * as phaseService from '../services/phase-alimentation.service';

/**
 * Controller PhaseAlimentation - Gestion HTTP des phases d'alimentation
 * Appelle la couche service (qui appelle les repositories)
 */

export async function getAllPhaseAlimentations(req: Request, res: Response): Promise<void> {
  try {
    const phases = await phaseService.getAllPhases();
    res.json({ success: true, data: phases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function getPhaseAlimentationById(req: Request, res: Response): Promise<void> {
  try {
    const phaseId = parseInt(req.params.id as string || '', 10);
    if (isNaN(phaseId)) {
      res.status(400).json({ success: false, message: 'ID de phase invalide' });
      return;
    }

    const phase = await phaseService.getPhaseById(phaseId);
    if (!phase) {
      res.status(404).json({ success: false, message: 'Phase d\'alimentation non trouvée' });
      return;
    }
    res.json({ success: true, data: phase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createPhaseAlimentation(req: Request, res: Response): Promise<void> {
  try {
    const { code, label, weekFrom, weekTo, rationMinGPerDay, rationMaxGPerDay, objective, raceId, typeProductionId } = req.body;
    
    if (!code || !label || weekFrom === undefined || weekTo === undefined || rationMinGPerDay === undefined || rationMaxGPerDay === undefined) {
      res.status(400).json({ success: false, message: 'Code, label, weekFrom, weekTo, rationMinGPerDay, rationMaxGPerDay sont requis' });
      return;
    }

    const newPhase = await phaseService.createPhase({
      code,
      label,
      weekFrom,
      weekTo,
      rationMinGPerDay,
      rationMaxGPerDay,
      objective: objective ?? null,
      raceId: raceId ?? null,
      typeProductionId: typeProductionId ?? null
    });
    res.status(201).json({ success: true, data: newPhase, message: 'Phase d\'alimentation créée avec succès' });
  } catch (error) {
    const message = (error as Error).message;
    res.status(400).json({ success: false, message });
  }
}
