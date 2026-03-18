import { Request, Response } from 'express';
import * as achatService from '../services/achat.service';

function parseDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Date invalide');
  }
  return parsed;
}

export async function getAllAchats(req: Request, res: Response): Promise<void> {
  try {
    const achats = await achatService.getAllAchats();
    res.status(200).json({ success: true, data: achats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDepenses(req: Request, res: Response): Promise<void> {
  try {
    const startDate = parseDate(req.query.startDate as string | undefined);
    const endDate = parseDate(req.query.endDate as string | undefined);
    if ((startDate && !endDate) || (!startDate && endDate)) {
      res.status(400).json({ success: false, message: 'startDate et endDate doivent être fournis ensemble' });
      return;
    }

    const totalExpensesAr = await achatService.getTotalDepenses(startDate, endDate);
    res.status(200).json({ success: true, data: { totalExpensesAr } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function createAchat(req: Request, res: Response): Promise<void> {
  try {
    const created = await achatService.createAchat(req.body);
    res.status(201).json({ success: true, data: created, message: 'Achat enregistré avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
