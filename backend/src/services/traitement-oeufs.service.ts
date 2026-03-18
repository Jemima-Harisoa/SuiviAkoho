import * as traitementOeufsRepository from '../repositories/traitement-oeufs.repository';
import * as suiviOeufRepository from '../repositories/suivi-oeuf.repository';
import * as lotRepository from '../repositories/lot.repository';
import { TraitementOeufs, CreateTraitementOeufsDTO } from '../models/traitement-oeufs.model';

export async function getAllTraitement(): Promise<TraitementOeufs[]> {
  return traitementOeufsRepository.findAll();
}

export async function getTraitementBySuiviOeuf(suiviOeufId: number): Promise<TraitementOeufs[]> {
  if (suiviOeufId <= 0) throw new Error('SuiviOeufId doit être positif');
  
  const suivi = await suiviOeufRepository.findById(suiviOeufId);
  if (!suivi) throw new Error(`Suivi œuf non trouvé`);
  
  return traitementOeufsRepository.findBySuiviOeuf(suiviOeufId);
}

export async function getTraitementByLot(sourceLotId: number): Promise<TraitementOeufs[]> {
  if (sourceLotId <= 0) throw new Error('LotId doit être positif');
  
  const lot = await lotRepository.findById(sourceLotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  return traitementOeufsRepository.findByLot(sourceLotId);
}

export async function getTraitementByType(treatmentType: string): Promise<TraitementOeufs[]> {
  const validTypes = ['VENTE', 'INCUBATION'];
  if (!validTypes.includes(treatmentType)) {
    throw new Error(`Type invalide. Doit être: ${validTypes.join(', ')}`);
  }
  
  return traitementOeufsRepository.findByType(treatmentType);
}

export async function createTraitement(data: CreateTraitementOeufsDTO): Promise<TraitementOeufs> {
  // Validation du lot d'origine
  if (data.sourceLotId <= 0) throw new Error('SourceLotId doit être positif');
  
  const lot = await lotRepository.findById(data.sourceLotId);
  if (!lot) throw new Error(`Lot source non trouvé`);
  
  // Validation du suivi œuf
  if (data.suiviOeufId <= 0) throw new Error('SuiviOeufId doit être positif');
  
  const suivi = await suiviOeufRepository.findById(data.suiviOeufId);
  if (!suivi) throw new Error(`Suivi œuf non trouvé`);
  
  // Vérifier que le suivi appartient au lot
  if (suivi.lotId !== data.sourceLotId) {
    throw new Error(`Le suivi n'appartient pas au lot spécifié`);
  }
  
  // Validation type
  const validTypes = ['VENTE', 'INCUBATION'];
  if (!validTypes.includes(data.processType)) {
    throw new Error(`Type invalide. Doit être: ${validTypes.join(', ')}`);  
  }
  
  // Validation quantité
  if (data.eggCount <= 0) throw new Error('Quantité d\'œufs doit être > 0');
  
  // Vérifier qu'il y a assez d'œufs disponibles à l'instant t (au dernier contrôle du lot)
  const lotSuivis = await suiviOeufRepository.findByLot(data.sourceLotId);
  if (lotSuivis.length === 0) {
    throw new Error(`Aucun suivi œuf trouvé pour ce lot`);
  }
  
  // Prendre le dernier suivi (semaine la plus élevée)
  const lastSuivi = lotSuivis.reduce((max, current) => 
    current.week > max.week ? current : max
  );
  
  if (data.eggCount > lastSuivi.eggsPerWeek) {
    throw new Error(`Quantité insuffisante. ${lastSuivi.eggsPerWeek} œufs disponibles à la semaine ${lastSuivi.week}`);
  }
  
  // Validation pour VENTE
  if (data.processType === 'VENTE') {
    if (data.unitPriceAr === undefined || data.unitPriceAr === null || data.unitPriceAr <= 0) {
      throw new Error('Prix unitaire requis et doit être > 0 pour une vente');
    }
  }
  
  return traitementOeufsRepository.create(data);
}

export async function deleteTraitement(traitementId: number): Promise<void> {
  if (traitementId <= 0) throw new Error('TraitementId doit être positif');
  
  const traitements = await traitementOeufsRepository.findAll();
  const found = traitements.find(t => t.traitementOeufsId === traitementId);
  if (!found) throw new Error(`Traitement non trouvé`);
  
  await traitementOeufsRepository.delete$(traitementId);
}

/**
 * Calcule le montant total d'une vente d'œufs
 * @param count Nombre d'œufs
 * @param unitPrice Prix unitaire en Ar
 * @returns Montant total en Ar
 */
export function calculateSaleAmount(count: number, unitPrice: number): number {
  return count * unitPrice;
}
