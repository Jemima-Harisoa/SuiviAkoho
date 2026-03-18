import { Request, Response } from 'express';
import * as traitementService from '../services/traitement-oeufs.service';

export async function getAllTraitement(req: Request, res: Response): Promise<void> {
  try {
    const traitements = await traitementService.getAllTraitement();
    res.status(200).json({ success: true, data: traitements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getTraitementBySuiviOeuf(req: Request, res: Response): Promise<void> {
  try {
    const { suiviOeufId } = req.params;
    const traitements = await traitementService.getTraitementBySuiviOeuf(parseInt(suiviOeufId as string));
    res.status(200).json({ success: true, data: traitements });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getTraitementByType(req: Request, res: Response): Promise<void> {
  try {
    const { type } = req.params;
    const traitements = await traitementService.getTraitementByType(type as string);
    res.status(200).json({ success: true, data: traitements });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function createTraitement(req: Request, res: Response): Promise<void> {
  try {
    const traitement = await traitementService.createTraitement(req.body);
    res.status(201).json({ success: true, data: traitement, message: 'Traitement créé avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteTraitement(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await traitementService.deleteTraitement(parseInt(id as string));
    res.status(200).json({ success: true, message: 'Traitement supprimé avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
