import { Request, Response } from 'express';
import * as productionService from '../services/production.service';

function parsePositiveInt(value: string, fieldName: string): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} doit être un entier positif`);
  }
  return parsed;
}

export async function getProductionStock(req: Request, res: Response): Promise<void> {
  try {
    const stock = await productionService.getAvailableStock();
    res.status(200).json({ success: true, data: stock });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProductionValeur(req: Request, res: Response): Promise<void> {
  try {
    const totalStockValueAr = await productionService.getStockValue();
    res.status(200).json({ success: true, data: { totalStockValueAr } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createProduction(req: Request, res: Response): Promise<void> {
  try {
    const created = await productionService.createProduction(req.body);
    res.status(201).json({ success: true, data: created, message: 'Production créée avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateProduction(req: Request, res: Response): Promise<void> {
  try {
    const productionId = parsePositiveInt(req.params.id as string, 'id');
    const updated = await productionService.updateProduction(productionId, req.body);
    res.status(200).json({ success: true, data: updated, message: 'Production mise à jour avec succès' });
  } catch (error: any) {
    const statusCode = error.message.includes('non trouvé') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
