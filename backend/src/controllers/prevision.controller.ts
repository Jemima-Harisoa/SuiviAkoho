import { Request, Response } from 'express';
import * as previsionService from '../services/prevision.service';

function parsePositiveInt(value: string, fieldName: string): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} doit être un entier positif`);
  }
  return parsed;
}

export async function getAllPrevisions(req: Request, res: Response): Promise<void> {
  try {
    const previsions = await previsionService.getAllPrevisions();
    res.status(200).json({ success: true, data: previsions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getBudget(req: Request, res: Response): Promise<void> {
  try {
    const summary = await previsionService.getBudgetSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createPrevision(req: Request, res: Response): Promise<void> {
  try {
    const created = await previsionService.createPrevision(req.body);
    res.status(201).json({ success: true, data: created, message: 'Prévision créée avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}

export async function realiserPrevision(req: Request, res: Response): Promise<void> {
  try {
    const previsionId = parsePositiveInt(req.params.id as string, 'id');
    const updated = await previsionService.markPrevisionAsRealized(previsionId, {
      realizedDate: req.body?.realizedDate,
      realizedAmountAr: req.body?.realizedAmountAr,
      notes: req.body?.notes
    });

    res.status(200).json({ success: true, data: updated, message: 'Prévision marquée comme réalisée' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
