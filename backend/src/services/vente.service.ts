import * as lotRepository from '../repositories/lot.repository';
import * as productionRepository from '../repositories/production.repository';
import * as venteRepository from '../repositories/historique-vente.repository';
import { CreateHistoriqueVenteDto, HistoriqueVente } from '../models/historique-gain.model';

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

export async function getAllVentes(): Promise<HistoriqueVente[]> {
  return venteRepository.findAll();
}

export async function getChiffreAffaires(startDate?: Date, endDate?: Date): Promise<number> {
  return venteRepository.getTotalRevenue(startDate, endDate);
}

export async function createVente(data: CreateHistoriqueVenteDto): Promise<HistoriqueVente> {
  if (data.productionId <= 0) {
    throw new Error('productionId doit être positif');
  }
  if (data.quantity <= 0) {
    throw new Error('quantity doit être > 0');
  }

  const production = await productionRepository.findById(data.productionId);
  if (!production) {
    throw new Error('Production non trouvée');
  }
  if (!production.isActive) {
    throw new Error('La production est inactive');
  }
  if (production.availableQuantity < data.quantity) {
    throw new Error(`Stock insuffisant: disponible=${production.availableQuantity}`);
  }

  const lotId = data.lotId ?? production.lotId ?? null;
  if (lotId !== null) {
    const lot = await lotRepository.findById(lotId);
    if (!lot) {
      throw new Error('Lot non trouvé');
    }
  }

  const unitPriceAr = data.unitPriceAr ?? production.unitPriceAr;
  if (unitPriceAr === null || unitPriceAr === undefined) {
    throw new Error('unitPriceAr est requis (non défini sur la production)');
  }
  if (unitPriceAr < 0) {
    throw new Error('unitPriceAr doit être >= 0');
  }

  const saleDate = parseDate(data.saleDate);

  const created = await venteRepository.create({
    productionId: data.productionId,
    lotId,
    saleDate,
    productType: (data.productType ?? production.productType).toUpperCase(),
    quantity: data.quantity,
    unitPriceAr,
    estimatedCostAr: data.estimatedCostAr ?? null,
    customerName: data.customerName ?? null,
    notes: data.notes ?? null
  });

  const newQty = production.availableQuantity - data.quantity;
  await productionRepository.update(production.productionId, {
    availableQuantity: newQty,
    isActive: newQty > 0
  });

  return created;
}
