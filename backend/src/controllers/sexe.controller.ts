import { Request, Response } from 'express';
import * as sexeRepository from '../repositories/sexe.repository';

export async function getAllSexes(req: Request, res: Response): Promise<void> {
  try {
    const sexes = await sexeRepository.findAll();
    res.json(sexes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function getSexeById(req: Request, res: Response): Promise<void> {
  try {
    const sexeId = parseInt(req.params.id as string || '', 10);
    if (isNaN(sexeId)) {
      res.status(400).json({ message: 'ID de sexe invalide' });
      return;
    }

    const sexe = await sexeRepository.findById(sexeId);
    if (!sexe) {
      res.status(404).json({ message: 'Sexe non trouvé' });
      return;
    }
    res.json(sexe);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createSexe(req: Request, res: Response): Promise<void> {
  try {
    const { code, label } = req.body;
    
    if (!code || !label) {
      res.status(400).json({ message: 'Code et label sont requis' });
      return;
    }

    // Vérifier que le code n'existe pas
    const existing = await sexeRepository.findByCode(code);
    if (existing) {
      res.status(400).json({ message: 'Ce code existe déjà' });
      return;
    }

    const newSexe = await sexeRepository.create({ code, label });
    res.status(201).json(newSexe);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}
