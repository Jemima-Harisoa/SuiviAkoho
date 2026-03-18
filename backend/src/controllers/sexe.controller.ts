import { Request, Response } from 'express';
import * as sexeService from '../services/sexe.service';

/**
 * Controller Sexe - Gestion HTTP des sexes de poulets
 * Appelle la couche service (qui appelle les repositories)
 */

export async function getAllSexes(req: Request, res: Response): Promise<void> {
  try {
    const sexes = await sexeService.getAllSexes();
    res.json({ success: true, data: sexes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function getSexeById(req: Request, res: Response): Promise<void> {
  try {
    const sexeId = parseInt(req.params.id as string || '', 10);
    if (isNaN(sexeId)) {
      res.status(400).json({ success: false, message: 'ID de sexe invalide' });
      return;
    }

    const sexe = await sexeService.getSexeById(sexeId);
    if (!sexe) {
      res.status(404).json({ success: false, message: 'Sexe non trouvé' });
      return;
    }
    res.json({ success: true, data: sexe });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createSexe(req: Request, res: Response): Promise<void> {
  try {
    const { code, label } = req.body;
    
    if (!code || !label) {
      res.status(400).json({ success: false, message: 'Code et label sont requis' });
      return;
    }

    const newSexe = await sexeService.createSexe({ code, label });
    res.status(201).json({ success: true, data: newSexe, message: 'Sexe créé avec succès' });
  } catch (error) {
    const message = (error as Error).message;
    res.status(400).json({ success: false, message });
  }
}
