import * as lotRepository from '../repositories/lot.repository';
import * as previsionRepository from '../repositories/prevision.repository';
import { CreatePrevisionDto, Prevision, UpdatePrevisionDto } from '../models/prevision.model';

function parseDate(value: Date | string): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  throw new Error('Date invalide');
}

export async function getAllPrevisions(): Promise<Prevision[]> {
  return previsionRepository.findAll();
}

export async function getBudgetSummary(): Promise<{ totalPlannedAr: number; totalRealizedAr: number; varianceAr: number }> {
  return previsionRepository.getBudgetSummary();
}

export async function createPrevision(data: CreatePrevisionDto): Promise<Prevision> {
  if (!data.category || data.category.trim().length === 0) {
    throw new Error('category est requis');
  }
  if (!data.description || data.description.trim().length === 0) {
    throw new Error('description est requis');
  }
  if (data.plannedAmountAr <= 0) {
    throw new Error('plannedAmountAr doit être > 0');
  }

  if (data.lotId !== undefined && data.lotId !== null) {
    const lot = await lotRepository.findById(data.lotId);
    if (!lot) {
      throw new Error('Lot non trouvé');
    }
  }

  const plannedDate = parseDate(data.plannedDate);

  return previsionRepository.create({
    ...data,
    plannedDate,
    category: data.category.trim().toUpperCase(),
    description: data.description.trim(),
    status: data.status?.trim().toUpperCase() ?? 'EN_ATTENTE'
  });
}

export async function markPrevisionAsRealized(previsionId: number, data: { realizedDate?: Date | string; realizedAmountAr: number; notes?: string | null }): Promise<Prevision> {
  if (previsionId <= 0) {
    throw new Error('previsionId doit être positif');
  }
  if (data.realizedAmountAr < 0) {
    throw new Error('realizedAmountAr doit être >= 0');
  }

  const current = await previsionRepository.findById(previsionId);
  if (!current) {
    throw new Error('Prévision non trouvée');
  }

  const realizedDate = data.realizedDate ? parseDate(data.realizedDate) : new Date();

  const updateData: UpdatePrevisionDto = {
    status: 'REALISEE',
    realizedDate,
    realizedAmountAr: data.realizedAmountAr,
    notes: data.notes ?? current.notes
  };

  return previsionRepository.update(previsionId, updateData);
}
