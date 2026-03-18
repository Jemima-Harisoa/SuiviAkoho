import { Request, Response } from 'express';
import * as lotService from '../services/lot.service';

export async function getAllLots(req: Request, res: Response): Promise<void> {
  try {
    const lots = await lotService.getAllLots();
    res.status(200).json({ success: true, data: lots });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getLotById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const lot = await lotService.getLotById(parseInt(id as string));
    res.status(200).json({ success: true, data: lot });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getLotByCode(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;
    const lot = await lotService.getLotByCode(code as string);
    res.status(200).json({ success: true, data: lot });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getLotsByStatus(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.params;
    const lots = await lotService.getLotsByStatus(status as string);
    res.status(200).json({ success: true, data: lots });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getLotsByRace(req: Request, res: Response): Promise<void> {
  try {
    const { raceId } = req.params;
    const lots = await lotService.getLotsByRace(parseInt(raceId as string));
    res.status(200).json({ success: true, data: lots });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function createLot(req: Request, res: Response): Promise<void> {
  try {
    const lot = await lotService.createLot(req.body);
    res.status(201).json({ success: true, data: lot, message: 'Lot créé avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateLot(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const lot = await lotService.updateLot(parseInt(id as string), req.body);
    res.status(200).json({ success: true, data: lot, message: 'Lot mis à jour avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function deleteLot(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await lotService.deleteLot(parseInt(id as string));
    res.status(200).json({ success: true, message: 'Lot supprimé avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function closeLot(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const lot = await lotService.closeLot(parseInt(id as string));
    res.status(200).json({ success: true, data: lot, message: 'Lot clôturé avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
