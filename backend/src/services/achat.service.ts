import * as achatRepository from '../repositories/historique-achat.repository';
import * as lotRepository from '../repositories/lot.repository';
import * as previsionRepository from '../repositories/prevision.repository';
import { CreateHistoriqueAchatDto, HistoriqueAchat } from '../models/historique-perte.model';

function parseDate(value?: Date | string): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

export async function getAllAchats(): Promise<HistoriqueAchat[]> {
  return achatRepository.findAll();
}

export async function getTotalDepenses(startDate?: Date, endDate?: Date): Promise<number> {
  return achatRepository.getTotalExpenses(startDate, endDate);
}

export async function createAchat(data: CreateHistoriqueAchatDto): Promise<HistoriqueAchat> {
  if (!data.category || data.category.trim().length === 0) {
    throw new Error('category est requis');
  }
  if (!data.itemName || data.itemName.trim().length === 0) {
    throw new Error('itemName est requis');
  }
  if (data.quantity !== undefined && data.quantity !== null && data.quantity <= 0) {
    throw new Error('quantity doit être > 0');
  }
  if (data.unitPriceAr !== undefined && data.unitPriceAr !== null && data.unitPriceAr < 0) {
    throw new Error('unitPriceAr doit être >= 0');
  }

  if (data.lotId !== undefined && data.lotId !== null) {
    const lot = await lotRepository.findById(data.lotId);
    if (!lot) {
      throw new Error('Lot non trouvé');
    }
  }

  if (data.previsionId !== undefined && data.previsionId !== null) {
    const prevision = await previsionRepository.findById(data.previsionId);
    if (!prevision) {
      throw new Error('Prévision non trouvée');
    }
  }

  const purchaseDate = parseDate(data.purchaseDate);
  const created = await achatRepository.create({
    ...data,
    purchaseDate,
    category: data.category.trim().toUpperCase(),
    itemName: data.itemName.trim()
  });

  if (created.previsionId) {
    await previsionRepository.update(created.previsionId, {
      status: 'REALISEE',
      realizedDate: created.purchaseDate,
      realizedAmountAr: created.totalAmountAr ?? null
    });
  }

  return created;
}
