import { Request, Response } from 'express';
import * as uniteService from '../services/unite.service';

/**
 * Controller Unite - Gestion HTTP des unités de mesure
 * Appelle la couche service (qui appelle les repositories)
 */

export async function getAllUnites(req: Request, res: Response): Promise<void> {
  try {
    const unites = await uniteService.getAllUnites();
    res.json({ success: true, data: unites });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function getUniteById(req: Request, res: Response): Promise<void> {
  try {
    const uniteId = parseInt(req.params.id as string || '', 10);
    if (isNaN(uniteId)) {
      res.status(400).json({ success: false, message: 'ID invalide' });
      return;
    }

    const unite = await uniteService.getUniteById(uniteId);
    if (!unite) {
      res.status(404).json({ success: false, message: 'Unité non trouvée' });
      return;
    }
    res.json({ success: true, data: unite });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createUnite(req: Request, res: Response): Promise<void> {
  try {
    const { code, label } = req.body;
    
    if (!code || !label) {
      res.status(400).json({ success: false, message: 'Code et label sont requis' });
      return;
    }

    const newUnite = await uniteService.createUnite({ code, label });
    res.status(201).json({ success: true, data: newUnite, message: 'Unité créée avec succès' });
  } catch (error) {
    const message = (error as Error).message;
    res.status(400).json({ success: false, message });
  }
}
