import { Request, Response } from 'express';
import * as uniteRepository from '../repositories/unite.repository';

export async function getAllUnites(req: Request, res: Response): Promise<void> {
  try {
    const unites = await uniteRepository.findAll();
    res.json(unites);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function getUniteById(req: Request, res: Response): Promise<void> {
  try {
    const uniteId = parseInt(req.params.id as string || '', 10);
    if (isNaN(uniteId)) {
      res.status(400).json({ message: 'ID invalide' });
      return;
    }

    const unite = await uniteRepository.findById(uniteId);
    if (!unite) {
      res.status(404).json({ message: 'Unité non trouvée' });
      return;
    }
    res.json(unite);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createUnite(req: Request, res: Response): Promise<void> {
  try {
    const { code, label } = req.body;
    
    if (!code || !label) {
      res.status(400).json({ message: 'Code et label sont requis' });
      return;
    }

    const newUnite = await uniteRepository.create({ code, label });
    res.status(201).json(newUnite);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}
