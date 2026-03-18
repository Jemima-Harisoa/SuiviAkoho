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
  if (data.avgWeightG !== undefined && data.avgWeightG !== null && data.avgWeightG < 0) {
    throw new Error('Poids moyen doit être >= 0');
  }
  
  // Validation aliments
  if (data.feedTotalKg !== undefined && data.feedTotalKg !== null && data.feedTotalKg < 0) {
    throw new Error('Aliments fournis doit être >= 0');
  }
  
  // Validation coût
  if (data.feedCostAr !== undefined && data.feedCostAr !== null && data.feedCostAr < 0) {
    throw new Error('Coût alimentation doit être >= 0');
  }
  
  return suiviPouletRepository.create(data);
}

export async function updateSuiviPoulet(suiviPouletId: number, data: UpdateSuiviPouletDTO): Promise<SuiviPoulet> {
  // Récupérer le suivi par ID
  const currentSuivi = await suiviPouletRepository.findById(suiviPouletId);
  if (!currentSuivi) throw new Error(`Suivi poulet non trouvé`);
  
  const lot = await lotRepository.findById(currentSuivi.lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  // Validation des données fournies
  if (data.avgWeightG !== undefined && data.avgWeightG !== null && data.avgWeightG < 0) {
    throw new Error('Poids moyen doit être >= 0');
  }
  if (data.feedTotalKg !== undefined && data.feedTotalKg !== null && data.feedTotalKg < 0) {
    throw new Error('Aliments fournis doit être >= 0');
  }
  if (data.feedCostAr !== undefined && data.feedCostAr !== null && data.feedCostAr < 0) {
    throw new Error('Coût alimentation doit être >= 0');
  }
  
  return suiviPouletRepository.update(suiviPouletId, data);
}

export async function deleteSuiviPoulet(suiviPouletId: number): Promise<void> {
  const allSuivis = await suiviPouletRepository.findAll();
  const suivi = allSuivis.find(s => s.suiviPouletId === suiviPouletId);
  if (!suivi) throw new Error(`Suivi poulet non trouvé`);
  
  await suiviPouletRepository.delete$(suiviPouletId);
}
