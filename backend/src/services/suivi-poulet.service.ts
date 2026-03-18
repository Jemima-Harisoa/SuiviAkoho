import * as suiviPouletRepository from '../repositories/suivi-poulet.repository';
import * as lotRepository from '../repositories/lot.repository';
import { SuiviPoulet, CreateSuiviPouletDTO, UpdateSuiviPouletDTO } from '../models/suivi-poulet.model';

export async function getAllSuiviPoulet(): Promise<SuiviPoulet[]> {
  return suiviPouletRepository.findAll();
}

export async function getSuiviPouletByLot(lotId: number): Promise<SuiviPoulet[]> {
  if (lotId <= 0) throw new Error('LotId doit être positif');
  
  const lot = await lotRepository.findById(lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  return suiviPouletRepository.findByLot(lotId);
}

export async function getSuiviPouletByLotAndWeek(lotId: number, week: number): Promise<SuiviPoulet> {
  if (lotId <= 0) throw new Error('LotId doit être positif');
  if (week <= 0) throw new Error('Semaine doit être > 0');
  
  const lot = await lotRepository.findById(lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  const suivi = await suiviPouletRepository.findByLotAndWeek(lotId, week);
  if (!suivi) throw new Error(`Suivi poulet pour la semaine ${week} non trouvé`);
  
  return suivi;
}

export async function createSuiviPoulet(data: CreateSuiviPouletDTO): Promise<SuiviPoulet> {
  // Validation du lot
  if (data.lotId <= 0) throw new Error('LotId doit être positif');
  const lot = await lotRepository.findById(data.lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  // Validation semaine
  if (data.week <= 0) throw new Error('Semaine doit être > 0');
  
  // Vérifier que la semaine n'existe pas déjà pour ce lot
  const existing = await suiviPouletRepository.findByLotAndWeek(data.lotId, data.week);
  if (existing) {
    throw new Error(`Un suivi pour la semaine ${data.week} existe déjà pour ce lot`);
  }
  
  // Validation poids
  if (data.averageWeightG < 0) throw new Error('Poids moyen doit être >= 0');
  
  // Validation ration
  if (data.rationGPerDay < 0) throw new Error('Ration journalière doit être >= 0');
  if (data.suppliedRationG < 0) throw new Error('Ration fournie doit être >= 0');
  
  // Validation coût
  if (data.costPerAr < 0) throw new Error('Coût doit être >= 0');
  
  // Validation mortalité et ventes
  if (data.mortality < 0) throw new Error('Mortalité doit être >= 0');
  if (data.mortality > lot.initialCount) {
    throw new Error('Mortalité ne peut pas dépasser l\'effectif initial');
  }
  if (data.soldCount < 0) throw new Error('Nombre vendu doit être >= 0');
  if (data.mortality + data.soldCount > lot.initialCount) {
    throw new Error('Mortalité + ventes ne peut pas dépasser l\'effectif initial');
  }
  
  return suiviPouletRepository.create(data);
}

export async function updateSuiviPoulet(suiviPouletId: number, data: UpdateSuiviPouletDTO): Promise<SuiviPoulet> {
  const suivi = await suiviPouletRepository.findByLot(suiviPouletId);
  if (!suivi || suivi.length === 0) throw new Error(`Suivi poulet non trouvé`);
  
  const currentSuivi = suivi[0];
  const lot = await lotRepository.findById(currentSuivi.lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  // Validation des données fournies
  if (data.averageWeightG !== undefined && data.averageWeightG < 0) {
    throw new Error('Poids moyen doit être >= 0');
  }
  if (data.rationGPerDay !== undefined && data.rationGPerDay < 0) {
    throw new Error('Ration journalière doit être >= 0');
  }
  if (data.suppliedRationG !== undefined && data.suppliedRationG < 0) {
    throw new Error('Ration fournie doit être >= 0');
  }
  if (data.costPerAr !== undefined && data.costPerAr < 0) {
    throw new Error('Coût doit être >= 0');
  }
  if (data.mortality !== undefined && data.mortality < 0) {
    throw new Error('Mortalité doit être >= 0');
  }
  if (data.mortality !== undefined && data.mortality > lot.initialCount) {
    throw new Error('Mortalité ne peut pas dépasser l\'effectif initial');
  }
  if (data.soldCount !== undefined && data.soldCount < 0) {
    throw new Error('Nombre vendu doit être >= 0');
  }
  
  // Vérifier cohérence finale
  const finalMortality = data.mortality !== undefined ? data.mortality : currentSuivi.mortality;
  const finalSoldCount = data.soldCount !== undefined ? data.soldCount : currentSuivi.soldCount;
  
  if (finalMortality + finalSoldCount > lot.initialCount) {
    throw new Error('Mortalité + ventes ne peut pas dépasser l\'effectif initial');
  }
  
  return suiviPouletRepository.update(suiviPouletId, data);
}

export async function deleteSuiviPoulet(suiviPouletId: number): Promise<void> {
  const suivi = await suiviPouletRepository.findByLot(suiviPouletId);
  if (!suivi || suivi.length === 0) throw new Error(`Suivi poulet non trouvé`);
  
  await suiviPouletRepository.delete$(suiviPouletId);
}
