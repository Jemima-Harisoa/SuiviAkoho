import { Request, Response } from 'express';
import * as phaseAlimentationRepository from '../repositories/phase-alimentation.repository';

export async function getAllPhaseAlimentations(req: Request, res: Response): Promise<void> {
  try {
    const phases = await phaseAlimentationRepository.findAll();
    res.json(phases);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function getPhaseAlimentationById(req: Request, res: Response): Promise<void> {
  try {
    const phaseId = parseInt(req.params.id as string || '', 10);
    if (isNaN(phaseId)) {
      res.status(400).json({ message: 'ID de phase invalide' });
      return;
    }

    const phase = await phaseAlimentationRepository.findById(phaseId);
    if (!phase) {
      res.status(404).json({ message: 'Phase d\'alimentation non trouvée' });
      return;
    }
    res.json(phase);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createPhaseAlimentation(req: Request, res: Response): Promise<void> {
  try {
    const { code, label, weekFrom, weekTo, rationMinGPerDay, rationMaxGPerDay, objective, raceId, typeProductionId } = req.body;
    
    if (!code || !label || weekFrom === undefined || weekTo === undefined || rationMinGPerDay === undefined || rationMaxGPerDay === undefined) {
      res.status(400).json({ message: 'Code, label, weekFrom, weekTo, rationMinGPerDay, rationMaxGPerDay sont requis' });
      return;
    }

    if (weekFrom > weekTo) {
      res.status(400).json({ message: 'weekFrom ne peut pas être supérieur à weekTo' });
      return;
    }

    if (rationMinGPerDay > rationMaxGPerDay) {
      res.status(400).json({ message: 'rationMinGPerDay ne peut pas être supérieur à rationMaxGPerDay' });
      return;
    }

    const newPhase = await phaseAlimentationRepository.create({
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
    res.status(201).json(newPhase);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}
