import { Request, Response } from 'express';
import * as historiqueService from '../services/historique-suivi-poulet.service';

function parsePositiveInt(value: string, fieldName: string): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} doit être un entier positif`);
  }
  return parsed;
}

export async function getAllHistoriqueSuiviPoulet(req: Request, res: Response): Promise<void> {
  try {
    const historiques = await historiqueService.getAllHistoriqueSuiviPoulet();
    res.status(200).json({ success: true, data: historiques });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getHistoriqueSuiviPouletBySuiviPoulet(req: Request, res: Response): Promise<void> {
  try {
    const { suiviPouletId } = req.params;
    const historiques = await historiqueService.getHistoriqueSuiviPouletBySuiviPoulet(
      parsePositiveInt(suiviPouletId as string, 'suiviPouletId')
    );
    res.status(200).json({ success: true, data: historiques });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getHistoriqueSuiviPouletByLot(req: Request, res: Response): Promise<void> {
  try {
    const { lotId } = req.params;
    const historiques = await historiqueService.getHistoriqueSuiviPouletByLot(
      parsePositiveInt(lotId as string, 'lotId')
    );
    res.status(200).json({ success: true, data: historiques });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getHistoriqueSuiviPouletByEventType(req: Request, res: Response): Promise<void> {
  try {
    const { eventType } = req.params;
    const historiques = await historiqueService.getHistoriqueSuiviPouletByEventType(eventType as string);
    res.status(200).json({ success: true, data: historiques });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getHistoriqueSuiviPouletByDateRange(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ success: false, message: 'startDate et endDate sont requis' });
      return;
    }
    
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      res.status(400).json({ success: false, message: 'startDate et endDate doivent être des dates valides' });
      return;
    }
    
    const historiques = await historiqueService.getHistoriqueSuiviPouletByDateRange(start, end);
    res.status(200).json({ success: true, data: historiques });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getHistoriqueSuiviPouletById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const historique = await historiqueService.getHistoriqueSuiviPouletById(
      parsePositiveInt(id as string, 'id')
    );
    res.status(200).json({ success: true, data: historique });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function createHistoriqueSuiviPoulet(req: Request, res: Response): Promise<void> {
  try {
    const historique = await historiqueService.createHistoriqueSuiviPoulet(req.body);
    res.status(201).json({ success: true, data: historique, message: 'Historique suivi poulet créé avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateHistoriqueSuiviPoulet(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const historique = await historiqueService.updateHistoriqueSuiviPoulet(
      parsePositiveInt(id as string, 'id'),
      req.body
    );
    res.status(200).json({ success: true, data: historique, message: 'Historique suivi poulet mis à jour avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function deleteHistoriqueSuiviPoulet(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await historiqueService.deleteHistoriqueSuiviPoulet(parsePositiveInt(id as string, 'id'));
    res.status(200).json({ success: true, message: 'Historique suivi poulet supprimé avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
