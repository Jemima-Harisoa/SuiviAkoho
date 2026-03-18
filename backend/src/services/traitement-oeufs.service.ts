import * as traitementOeufsRepository from '../repositories/traitement-oeufs.repository';
import * as suiviOeufRepository from '../repositories/suivi-oeuf.repository';
import { TraitementOeufs, CreateTraitementOeufsDTO } from '../models/traitement-oeufs.model';

export async function getAllTraitement(): Promise<TraitementOeufs[]> {
  return traitementOeufsRepository.findAll();
}

export async function getTraitementBySuiviOeuf(suiviOeufId: number): Promise<TraitementOeufs[]> {
  if (suiviOeufId <= 0) throw new Error('SuiviOeufId doit être positif');
  
  const suivi = await suiviOeufRepository.findByLot(suiviOeufId);
  if (!suivi || suivi.length === 0) throw new Error(`Suivi œuf non trouvé`);
  
  return traitementOeufsRepository.findBySuiviOeuf(suiviOeufId);
}

export async function getTraitementByType(treatmentType: string): Promise<TraitementOeufs[]> {
  const validTypes = ['VENTE', 'INCUBATION'];
  if (!validTypes.includes(treatmentType)) {
    throw new Error(`Type invalide. Doit être: ${validTypes.join(', ')}`);
  }
  
  return traitementOeufsRepository.findByType(treatmentType);
}

export async function createTraitement(data: CreateTraitementOeufsDTO): Promise<TraitementOeufs> {
  // Validation du suivi œuf
  if (data.suiviOeufId <= 0) throw new Error('SuiviOeufId doit être positif');
  
  const suivi = await suiviOeufRepository.findByLot(data.suiviOeufId);
  if (!suivi || suivi.length === 0) throw new Error(`Suivi œuf non trouvé`);
  
  // Validation type
  const validTypes = ['VENTE', 'INCUBATION'];
  if (!validTypes.includes(data.treatmentType)) {
    throw new Error(`Type invalide. Doit être: ${validTypes.join(', ')}`);
  }
  
  // Validation quantité
  if (data.count <= 0) throw new Error('Quantité d\'œufs doit être > 0');
  
  // Vérifier qu'il y a assez d'œufs disponibles
  if (data.count > suivi[0].eggsPerWeek) {
    throw new Error(`Quantité insuffisante. ${suivi[0].eggsPerWeek} œufs disponibles`);
  }
  
  // Validation pour VENTE
  if (data.treatmentType === 'VENTE') {
    if (data.unitPrice === undefined || data.unitPrice <= 0) {
      throw new Error('Prix unitaire requis et doit être > 0 pour une vente');
    }
    if (data.totalAmountAr === undefined || data.totalAmountAr <= 0) {
      throw new Error('Montant total requis et doit être > 0 pour une vente');
    }
    // Vérifier cohérence: montantTotal = quantité * prixUnitaire
    const expectedAmount = data.count * data.unitPrice;
    if (Math.abs(data.totalAmountAr - expectedAmount) > 0.01) {
      throw new Error(`Montant total incohérent. Attendu: ${expectedAmount} Ar`);
    }
  }
  
  return traitementOeufsRepository.create(data);
}

export async function deleteTraitement(traitementId: number): Promise<void> {
  const traitement = await traitementOeufsRepository.findAll();
  const found = traitement.find(t => t.traitementId === traitementId);
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
