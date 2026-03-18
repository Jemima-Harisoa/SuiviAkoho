import * as lotRepository from '../repositories/lot.repository';
import { Lot, CreateLotDTO, UpdateLotDTO } from '../models/lot.model';

export async function getAllLots(): Promise<Lot[]> {
  return lotRepository.findAll();
}

export async function getLotById(lotId: number): Promise<Lot> {
  const lot = await lotRepository.findById(lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  return lot;
}

export async function getLotByCode(lotCode: string): Promise<Lot> {
  if (!lotCode || lotCode.trim().length === 0) {
    throw new Error(`Code du lot requis`);
  }
  const lot = await lotRepository.findByCode(lotCode);
  if (!lot) throw new Error(`Lot avec le code ${lotCode} non trouvé`);
  return lot;
}

export async function getLotsByStatus(status: string): Promise<Lot[]> {
  const validStatuses = ['ACTIF', 'CLOTURE', 'ANNULE'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Statut invalide. Doit être: ${validStatuses.join(', ')}`);
  }
  return lotRepository.findByStatus(status);
}

export async function getLotsByRace(raceId: number): Promise<Lot[]> {
  if (raceId <= 0) throw new Error(`RaceId doit être positif`);
  return lotRepository.findByRace(raceId);
}

export async function createLot(data: CreateLotDTO): Promise<Lot> {
  // Validation
  if (!data.lotCode || data.lotCode.trim().length === 0) {
    throw new Error('Code du lot requis');
  }
  if (data.initialCount <= 0) {
    throw new Error('Effectif initial doit être > 0');
  }
  if (data.maleCount < 0 || data.femaleCount < 0) {
    throw new Error('Nombre de mâles et femelles doit être >= 0');
  }
  if (data.maleCount + data.femaleCount > data.initialCount) {
    throw new Error('Mâles + femelles ne peut pas dépasser l\'effectif initial');
  }
  
  // Vérifier unicité du code
  const existing = await lotRepository.findByCode(data.lotCode);
  if (existing) {
    throw new Error(`Un lot avec le code ${data.lotCode} existe déjà`);
  }
  
  // Valider la date
  if (!(data.startDate instanceof Date) || isNaN(data.startDate.getTime())) {
    throw new Error('Date de démarrage invalide');
  }
  
  return lotRepository.create(data);
}

export async function updateLot(lotId: number, data: UpdateLotDTO): Promise<Lot> {
  const lot = await lotRepository.findById(lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  // Validation des données fornies
  if (data.initialCount !== undefined && data.initialCount <= 0) {
    throw new Error('Effectif initial doit être > 0');
  }
  if (data.maleCount !== undefined && data.maleCount < 0) {
    throw new Error('Nombre de mâles doit être >= 0');
  }
  if (data.femaleCount !== undefined && data.femaleCount < 0) {
    throw new Error('Nombre de femelles doit être >= 0');
  }
  
  // Vérifier cohérence mâles + femelles avec effectif
  const finalMaleCount = data.maleCount !== undefined ? data.maleCount : lot.maleCount;
  const finalFemaleCount = data.femaleCount !== undefined ? data.femaleCount : lot.femaleCount;
  const finalInitialCount = data.initialCount !== undefined ? data.initialCount : lot.initialCount;
  
  if (finalMaleCount + finalFemaleCount > finalInitialCount) {
    throw new Error('Mâles + femelles ne peut pas dépasser l\'effectif initial');
  }
  
  // Validation statut
  if (data.status !== undefined) {
    const validStatuses = ['ACTIF', 'CLOTURE', 'ANNULE'];
    if (!validStatuses.includes(data.status)) {
      throw new Error(`Statut invalide. Doit être: ${validStatuses.join(', ')}`);
    }
  }
  
  return lotRepository.update(lotId, data);
}

export async function deleteLot(lotId: number): Promise<void> {
  const lot = await lotRepository.findById(lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  await lotRepository.delete$(lotId);
}

export async function closeLot(lotId: number): Promise<Lot> {
  return updateLot(lotId, { status: 'CLOTURE' });
}
