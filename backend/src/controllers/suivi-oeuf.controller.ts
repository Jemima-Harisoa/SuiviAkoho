import { Request, Response } from 'express';
import * as suiviOeufService from '../services/suivi-oeuf.service';

export async function getAllSuiviOeuf(req: Request, res: Response): Promise<void> {
  try {
    const suivis = await suiviOeufService.getAllSuiviOeuf();
    res.status(200).json({ success: true, data: suivis });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSuiviOeufByLot(req: Request, res: Response): Promise<void> {
  try {
    const { lotId } = req.params;
    const suivis = await suiviOeufService.getSuiviOeufByLot(parseInt(lotId as string));
    res.status(200).json({ success: true, data: suivis });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getSuiviOeufByLotAndWeek(req: Request, res: Response): Promise<void> {
  try {
    const { lotId, week } = req.params;
    const suivi = await suiviOeufService.getSuiviOeufByLotAndWeek(parseInt(lotId as string), parseInt(week as string));
    res.status(200).json({ success: true, data: suivi });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function createSuiviOeuf(req: Request, res: Response): Promise<void> {
  try {
    const suivi = await suiviOeufService.createSuiviOeuf(req.body);
    res.status(201).json({ success: true, data: suivi, message: 'Suivi œuf créé avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateSuiviOeuf(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const suivi = await suiviOeufService.updateSuiviOeuf(parseInt(id as string), req.body);
    res.status(200).json({ success: true, data: suivi, message: 'Suivi œuf mis à jour avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function deleteSuiviOeuf(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await suiviOeufService.deleteSuiviOeuf(parseInt(id as string));
    res.status(200).json({ success: true, message: 'Suivi œuf supprimé avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
