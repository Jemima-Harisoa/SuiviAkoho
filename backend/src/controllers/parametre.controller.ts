import { Request, Response } from 'express';
import * as parametreRepository from '../repositories/parametre.repository';

export async function getAllParametres(req: Request, res: Response): Promise<void> {
  try {
    const parametres = await parametreRepository.findAll();
    res.json(parametres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function getParametreById(req: Request, res: Response): Promise<void> {
  try {
    const parametreId = parseInt(req.params.id as string || '', 10);
    if (isNaN(parametreId)) {
      res.status(400).json({ message: 'ID invalide' });
      return;
    }

    const parametre = await parametreRepository.findById(parametreId);
    if (!parametre) {
      res.status(404).json({ message: 'Paramètre non trouvé' });
      return;
    }
    res.json(parametre);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createParametre(req: Request, res: Response): Promise<void> {
  try {
    const { code, label, value, effectiveDate, endDate } = req.body;
    
    if (!code || !label || !value || !effectiveDate) {
      res.status(400).json({ message: 'Code, label, value, effectiveDate sont requis' });
      return;
    }

    const newParametre = await parametreRepository.create({
      code,
      label,
      value,
      effectiveDate,
      endDate: endDate ?? null
    });
    res.status(201).json(newParametre);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}
