import { Request, Response } from 'express';
import * as parametreService from '../services/parametre.service';

/**
 * Controller Parametre - Gestion HTTP des paramètres système
 * Appelle la couche service (qui appelle les repositories)
 */

export async function getAllParametres(req: Request, res: Response): Promise<void> {
  try {
    const parametres = await parametreService.getAllParametres();
    res.json({ success: true, data: parametres });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function getParametreById(req: Request, res: Response): Promise<void> {
  try {
    const parametreId = parseInt(req.params.id as string || '', 10);
    if (isNaN(parametreId)) {
      res.status(400).json({ success: false, message: 'ID invalide' });
      return;
    }

    const parametre = await parametreService.getParametreById(parametreId);
    if (!parametre) {
      res.status(404).json({ success: false, message: 'Paramètre non trouvé' });
      return;
    }
    res.json({ success: true, data: parametre });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createParametre(req: Request, res: Response): Promise<void> {
  try {
    const { code, label, value, effectiveDate, endDate } = req.body;
    
    if (!code || !label || !value || !effectiveDate) {
      res.status(400).json({ success: false, message: 'Code, label, value, effectiveDate sont requis' });
      return;
    }

    const newParametre = await parametreService.createParametre({
      code,
      label,
      value,
      effectiveDate,
      endDate: endDate ?? null
    });
    res.status(201).json({ success: true, data: newParametre, message: 'Paramètre créé avec succès' });
  } catch (error) {
    const message = (error as Error).message;
    res.status(400).json({ success: false, message });
  }
}
