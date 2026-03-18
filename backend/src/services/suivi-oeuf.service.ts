import * as suiviOeufRepository from '../repositories/suivi-oeuf.repository';
import * as lotRepository from '../repositories/lot.repository';
import { SuiviOeuf, CreateSuiviOeufDTO, UpdateSuiviOeufDTO } from '../models/suivi-oeuf.model';

export async function getAllSuiviOeuf(): Promise<SuiviOeuf[]> {
  return suiviOeufRepository.findAll();
}

export async function getSuiviOeufByLot(lotId: number): Promise<SuiviOeuf[]> {
  if (lotId <= 0) throw new Error('LotId doit être positif');
  
  const lot = await lotRepository.findById(lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  return suiviOeufRepository.findByLot(lotId);
}

export async function getSuiviOeufByLotAndWeek(lotId: number, week: number): Promise<SuiviOeuf> {
  if (lotId <= 0) throw new Error('LotId doit être positif');
  if (week <= 0) throw new Error('Semaine doit être > 0');
  
  const lot = await lotRepository.findById(lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  const suivi = await suiviOeufRepository.findByLotAndWeek(lotId, week);
  if (!suivi) throw new Error(`Suivi œuf pour la semaine ${week} non trouvé`);
  
  return suivi;
}

export async function createSuiviOeuf(data: CreateSuiviOeufDTO): Promise<SuiviOeuf> {
  // Validation du lot
  if (data.lotId <= 0) throw new Error('LotId doit être positif');
  const lot = await lotRepository.findById(data.lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  // Validation semaine
  if (data.week <= 0) throw new Error('Semaine doit être > 0');
  
  // Vérifier que la semaine n'existe pas déjà pour ce lot
  const existing = await suiviOeufRepository.findByLotAndWeek(data.lotId, data.week);
  if (existing) {
    throw new Error(`Un suivi pour la semaine ${data.week} existe déjà pour ce lot`);
  }
  
  // Validation œufs par jour
  if (data.eggsPerDay < 0) throw new Error('Œufs/jour doit être >= 0');
  
  // Validation œufs par semaine
  if (data.eggsPerWeek < 0) throw new Error('Œufs/semaine doit être >= 0');
  
  // Validation taux de ponte (0-100%)
  if (data.layingRatePct < 0 || data.layingRatePct > 100) {
    throw new Error('Taux de ponte doit être entre 0 et 100%');
  }
  
  return suiviOeufRepository.create(data);
}

export async function updateSuiviOeuf(suiviOeufId: number, data: UpdateSuiviOeufDTO): Promise<SuiviOeuf> {
  const suivi = await suiviOeufRepository.findByLot(suiviOeufId);
  if (!suivi || suivi.length === 0) throw new Error(`Suivi œuf non trouvé`);
  
  // Validation des données fournies
  if (data.eggsPerDay !== undefined && data.eggsPerDay < 0) {
    throw new Error('Œufs/jour doit être >= 0');
  }
  if (data.eggsPerWeek !== undefined && data.eggsPerWeek < 0) {
    throw new Error('Œufs/semaine doit être >= 0');
  }
  if (data.layingRatePct !== undefined && (data.layingRatePct < 0 || data.layingRatePct > 100)) {
    throw new Error('Taux de ponte doit être entre 0 et 100%');
  }
  
  return suiviOeufRepository.update(suiviOeufId, data);
}

export async function deleteSuiviOeuf(suiviOeufId: number): Promise<void> {
  const suivi = await suiviOeufRepository.findByLot(suiviOeufId);
  if (!suivi || suivi.length === 0) throw new Error(`Suivi œuf non trouvé`);
  
  await suiviOeufRepository.delete$(suiviOeufId);
}

/**
 * Calcule le taux de ponte: (œufs/jour) / (nb poules) * 100
 * @param eggsPerDay Nombre d'œufs par jour
 * @param chickenCount Nombre de poules
 * @returns Taux de ponte en pourcentage
 */
export function calculateLayingRate(eggsPerDay: number, chickenCount: number): number {
  if (chickenCount === 0) return 0;
  return (eggsPerDay / chickenCount) * 100;
}
