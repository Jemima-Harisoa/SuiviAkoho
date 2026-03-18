import { Request, Response } from 'express';
import * as incubationService from '../services/incubation.service';

export async function getAllIncubations(req: Request, res: Response): Promise<void> {
  try {
    const incubations = await incubationService.getAllIncubations();
    res.status(200).json({ success: true, data: incubations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getIncubationById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const incubation = await incubationService.getIncubationById(parseInt(id as string));
    res.status(200).json({ success: true, data: incubation });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getIncubationByLot(req: Request, res: Response): Promise<void> {
  try {
    const { lotId } = req.params;
    const incubations = await incubationService.getIncubationByLot(parseInt(lotId as string));
    res.status(200).json({ success: true, data: incubations });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function getIncubationByDateRange(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    const incubations = await incubationService.getIncubationByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.status(200).json({ success: true, data: incubations });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function createIncubation(req: Request, res: Response): Promise<void> {
  try {
    const incubation = await incubationService.createIncubation(req.body);
    res.status(201).json({ success: true, data: incubation, message: 'Incubation créée avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateIncubation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const incubation = await incubationService.updateIncubation(parseInt(id as string), req.body);
    res.status(200).json({ success: true, data: incubation, message: 'Incubation mise à jour avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function deleteIncubation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await incubationService.deleteIncubation(parseInt(id as string));
    res.status(200).json({ success: true, message: 'Incubation supprimée avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
