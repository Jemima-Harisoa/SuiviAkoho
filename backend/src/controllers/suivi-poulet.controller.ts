import { Request, Response } from 'express';
import * as suiviPouletService from '../services/suivi-poulet.service';

export async function getAllSuiviPoulet(req: Request, res: Response): Promise<void> {
  try {
    const suivis = await suiviPouletService.getAllSuiviPoulet();
    res.status(200).json({ success: true, data: suivis });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSuiviPouletByLot(req: Request, res: Response): Promise<void> {
  try {
    const { lotId } = req.params;
    const suivis = await suiviPouletService.getSuiviPouletByLot(parseInt(lotId as string));
    res.status(200).json({ success: true, data: suivis });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getSuiviPouletByLotAndWeek(req: Request, res: Response): Promise<void> {
  try {
    const { lotId, week } = req.params;
    const suivi = await suiviPouletService.getSuiviPouletByLotAndWeek(parseInt(lotId as string), parseInt(week as string));
    res.status(200).json({ success: true, data: suivi });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function createSuiviPoulet(req: Request, res: Response): Promise<void> {
  try {
    const suivi = await suiviPouletService.createSuiviPoulet(req.body);
    res.status(201).json({ success: true, data: suivi, message: 'Suivi poulet créé avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateSuiviPoulet(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const suivi = await suiviPouletService.updateSuiviPoulet(parseInt(id as string), req.body);
    res.status(200).json({ success: true, data: suivi, message: 'Suivi poulet mis à jour avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function deleteSuiviPoulet(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await suiviPouletService.deleteSuiviPoulet(parseInt(id as string));
    res.status(200).json({ success: true, message: 'Suivi poulet supprimé avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
