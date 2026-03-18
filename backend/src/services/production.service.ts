import * as lotRepository from '../repositories/lot.repository';
import * as productionRepository from '../repositories/production.repository';
import { CreateProductionDto, Production, UpdateProductionDto } from '../models/production.model';

export async function getAllProductions(): Promise<Production[]> {
  return productionRepository.findAll();
}

export async function getAvailableStock(): Promise<Production[]> {
  return productionRepository.findAvailableStock();
}

export async function getStockValue(): Promise<number> {
  return productionRepository.getTotalStockValue();
}

export async function createProduction(data: CreateProductionDto): Promise<Production> {
  if (!data.productType || data.productType.trim().length === 0) {
    throw new Error('productType est requis');
  }
  if (data.availableQuantity < 0) {
    throw new Error('availableQuantity doit être >= 0');
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

  return productionRepository.create({
    ...data,
    productType: data.productType.trim().toUpperCase(),
    unit: (data.unit ?? 'PIECE').trim().toUpperCase()
  });
}

export async function updateProduction(productionId: number, data: UpdateProductionDto): Promise<Production> {
  if (productionId <= 0) {
    throw new Error('productionId doit être positif');
  }

  const existing = await productionRepository.findById(productionId);
  if (!existing) {
    throw new Error('Production non trouvée');
  }

  if (data.availableQuantity !== undefined && data.availableQuantity < 0) {
    throw new Error('availableQuantity doit être >= 0');
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

  return productionRepository.update(productionId, data);
}
