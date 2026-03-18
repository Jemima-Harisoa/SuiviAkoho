import { Request, Response } from 'express';
import * as typeProductionRepository from '../repositories/type-production.repository';

export async function getTypeProductionById(req: Request, res: Response): Promise<void> {
  try {
    const sexeId = parseInt(req.params.id as string || '', 10);
    if (isNaN(sexeId)) {
      res.status(400).json({ message: 'ID de sexe invalide' });
      return;
    }

    const sexe = await typeProductionRepository.findById(sexeId);
    if (!sexe) {
      res.status(404).json({ message: 'Sexe non trouvé' });
      return;
    }
    res.json(sexe);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}


export async function getAllTypeProductions(req: Request, res: Response): Promise<void> {
  try {
    const types = await typeProductionRepository.findAll();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createTypeProduction(req: Request, res: Response): Promise<void> {
  try {
    const { code, label, sexeId } = req.body;
    
    if (!code || !label) {
      res.status(400).json({ message: 'Code et label sont requis' });
      return;
    }

    const newType = await typeProductionRepository.create({ code, label, sexeId: sexeId ?? null });
    res.status(201).json(newType);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}
