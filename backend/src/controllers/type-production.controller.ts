import { Request, Response } from 'express';
import * as typeProductionService from '../services/type-production.service';

/**
 * Controller TypeProduction - Gestion HTTP des types de production
 * Appelle la couche service (qui appelle les repositories)
 */

export async function getAllTypeProductions(req: Request, res: Response): Promise<void> {
  try {
    const types = await typeProductionService.getAllTypeProductions();
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function getTypeProductionById(req: Request, res: Response): Promise<void> {
  try {
    const typeId = parseInt(req.params.id as string || '', 10);
    if (isNaN(typeId)) {
      res.status(400).json({ success: false, message: 'ID de type invalide' });
      return;
    }

    const type = await typeProductionService.getTypeProductionById(typeId);
    if (!type) {
      res.status(404).json({ success: false, message: 'Type de production non trouvé' });
      return;
    }
    res.json({ success: true, data: type });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: (error as Error).message });
  }
}

export async function createTypeProduction(req: Request, res: Response): Promise<void> {
  try {
    const { code, label, sexeId } = req.body;
    
    if (!code || !label) {
      res.status(400).json({ success: false, message: 'Code et label sont requis' });
      return;
    }

    const newType = await typeProductionService.createTypeProduction({ code, label, sexeId: sexeId ?? null });
    res.status(201).json({ success: true, data: newType, message: 'Type de production créé avec succès' });
  } catch (error) {
    const message = (error as Error).message;
    res.status(400).json({ success: false, message });
  }
}
