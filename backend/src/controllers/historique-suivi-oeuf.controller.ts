import { Request, Response } from 'express';
import * as historiqueService from '../services/historique-suivi-oeuf.service';

function parsePositiveInt(value: string, fieldName: string): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} doit être un entier positif`);
  }
  return parsed;
}

export async function getAllHistoriqueSuiviOeuf(req: Request, res: Response): Promise<void> {
  try {
    const historiques = await historiqueService.getAllHistoriqueSuiviOeuf();
    res.status(200).json({ success: true, data: historiques });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getHistoriqueSuiviOeufBySuiviOeuf(req: Request, res: Response): Promise<void> {
  try {
    const { suiviOeufId } = req.params;
    const historiques = await historiqueService.getHistoriqueSuiviOeufBySuiviOeuf(
      parsePositiveInt(suiviOeufId as string, 'suiviOeufId')
    );
    res.status(200).json({ success: true, data: historiques });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getHistoriqueSuiviOeufByDateRange(req: Request, res: Response): Promise<void> {
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
    
    const historiques = await historiqueService.getHistoriqueSuiviOeufByDateRange(start, end);
    res.status(200).json({ success: true, data: historiques });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getHistoriqueSuiviOeufById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const historique = await historiqueService.getHistoriqueSuiviOeufById(parsePositiveInt(id as string, 'id'));
    res.status(200).json({ success: true, data: historique });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function createHistoriqueSuiviOeuf(req: Request, res: Response): Promise<void> {
  try {
    const historique = await historiqueService.createHistoriqueSuiviOeuf(req.body);
    res.status(201).json({ success: true, data: historique, message: 'Historique suivi oeuf créé avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateHistoriqueSuiviOeuf(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const historique = await historiqueService.updateHistoriqueSuiviOeuf(
      parsePositiveInt(id as string, 'id'),
      req.body
    );
    res.status(200).json({ success: true, data: historique, message: 'Historique suivi oeuf mis à jour avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function deleteHistoriqueSuiviOeuf(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await historiqueService.deleteHistoriqueSuiviOeuf(parsePositiveInt(id as string, 'id'));
    res.status(200).json({ success: true, message: 'Historique suivi oeuf supprimé avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
