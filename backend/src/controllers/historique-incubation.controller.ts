import { Request, Response } from 'express';
import * as historiqueService from '../services/historique-incubation.service';

function parsePositiveInt(value: string, fieldName: string): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} doit être un entier positif`);
  }
  return parsed;
}

export async function getAllHistoriqueIncubation(req: Request, res: Response): Promise<void> {
  try {
    const historiques = await historiqueService.getAllHistoriqueIncubation();
    res.status(200).json({ success: true, data: historiques });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getHistoriqueIncubationByIncubation(req: Request, res: Response): Promise<void> {
  try {
    const { incubationId } = req.params;
    const historiques = await historiqueService.getHistoriqueIncubationByIncubation(
      parsePositiveInt(incubationId as string, 'incubationId')
    );
    res.status(200).json({ success: true, data: historiques });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getHistoriqueIncubationByDateRange(req: Request, res: Response): Promise<void> {
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
    
    const historiques = await historiqueService.getHistoriqueIncubationByDateRange(start, end);
    res.status(200).json({ success: true, data: historiques });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getHistoriqueIncubationById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const historique = await historiqueService.getHistoriqueIncubationById(parsePositiveInt(id as string, 'id'));
    res.status(200).json({ success: true, data: historique });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function createHistoriqueIncubation(req: Request, res: Response): Promise<void> {
  try {
    const historique = await historiqueService.createHistoriqueIncubation(req.body);
    res.status(201).json({ success: true, data: historique, message: 'Historique incubation créé avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateHistoriqueIncubation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const historique = await historiqueService.updateHistoriqueIncubation(
      parsePositiveInt(id as string, 'id'),
      req.body
    );
    res.status(200).json({ success: true, data: historique, message: 'Historique incubation mis à jour avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function deleteHistoriqueIncubation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await historiqueService.deleteHistoriqueIncubation(parsePositiveInt(id as string, 'id'));
    res.status(200).json({ success: true, message: 'Historique incubation supprimé avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
