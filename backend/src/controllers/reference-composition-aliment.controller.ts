import { Request, Response } from 'express';
import * as compositionService from '../services/reference-composition-aliment.service';

/**
 * Controller ReferenceCompositionAliment - Gestion HTTP de la composition des aliments
 * Appelle la couche service (qui appelle les repositories)
 */

export async function getAllReferenceCompositionAliments(req: Request, res: Response): Promise<void> {
  try {
    const compositions = await compositionService.getAllCompositions();
    res.json({ success: true, data: compositions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function getReferenceCompositionAlimentById(req: Request, res: Response): Promise<void> {
  try {
    const compositionId = parseInt(req.params.id as string || '', 10);
    if (isNaN(compositionId)) {
      res.status(400).json({ success: false, message: 'ID invalide' });
      return;
    }

    const composition = await compositionService.getCompositionById(compositionId);
    if (!composition) {
      res.status(404).json({ success: false, message: 'Composition aliment non trouvée' });
      return;
    }
    res.json({ success: true, data: composition });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createReferenceCompositionAliment(req: Request, res: Response): Promise<void> {
  try {
    const { ingredient, percentMin, percentMax, notes, raceId, typeProductionId } = req.body;
    
    if (!ingredient) {
      res.status(400).json({ success: false, message: 'Ingredient est requis' });
      return;
    }

    const newComposition = await compositionService.createComposition({
      ingredient,
      percentMin: percentMin ?? null,
      percentMax: percentMax ?? null,
      notes: notes ?? null,
      raceId: raceId ?? null,
      typeProductionId: typeProductionId ?? null
    });
    res.status(201).json({ success: true, data: newComposition, message: 'Composition aliment créée avec succès' });
  } catch (error) {
    const message = (error as Error).message;
    res.status(400).json({ success: false, message });
  }
}
