import { Request, Response } from 'express';
import * as referenceCompositionAlimentRepository from '../repositories/reference-composition-aliment.repository';

export async function getAllReferenceCompositionAliments(req: Request, res: Response): Promise<void> {
  try {
    const compositions = await referenceCompositionAlimentRepository.findAll();
    res.json(compositions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function getReferenceCompositionAlimentById(req: Request, res: Response): Promise<void> {
  try {
    const compositionId = parseInt(req.params.id as string || '', 10);
    if (isNaN(compositionId)) {
      res.status(400).json({ message: 'ID invalide' });
      return;
    }

    const composition = await referenceCompositionAlimentRepository.findById(compositionId);
    if (!composition) {
      res.status(404).json({ message: 'Composition aliment non trouvée' });
      return;
    }
    res.json(composition);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createReferenceCompositionAliment(req: Request, res: Response): Promise<void> {
  try {
    const { ingredient, percentMin, percentMax, notes, raceId, typeProductionId } = req.body;
    
    if (!ingredient) {
      res.status(400).json({ message: 'Ingredient est requis' });
      return;
    }

    if (percentMin !== undefined && percentMax !== undefined && percentMin > percentMax) {
      res.status(400).json({ message: 'percentMin ne peut pas être supérieur à percentMax' });
      return;
    }

    const newComposition = await referenceCompositionAlimentRepository.create({
      ingredient,
      percentMin: percentMin ?? null,
      percentMax: percentMax ?? null,
      notes: notes ?? null,
      raceId: raceId ?? null,
      typeProductionId: typeProductionId ?? null
    });
    res.status(201).json(newComposition);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}
