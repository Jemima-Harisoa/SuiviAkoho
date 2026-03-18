import * as lotRepository from '../repositories/lot.repository';
import { Lot, CreateLotDTO, UpdateLotDTO } from '../models/lot.model';

// ============================================================================
// UTILITAIRES DE GESTION DU CYCLE D'ÉLEVAGE (basés sur Extension.md)
// ============================================================================

/**
 * Calcule l'âge du lot en semaines à partir de la date d'éclosion
 * @param hatchDate Date d'éclosion du lot (Jour 0)
 * @returns Nombre de semaines complètes depuis l'éclosion
 */
function calculateLotAgeWeeks(hatchDate: Date): number {
  const today = new Date();
  const diffMs = today.getTime() - hatchDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

/**
 * Détermine l'état de ponte du lot selon son âge
 * (Extension.md section 2: "Début de ponte: 20-24 semaines")
 * @param ageWeeks Âge du lot en semaines
 * @returns État: 'PRE_PONTE' | 'PONTE' | 'POST_PONTE'
 */
function determineLayingStage(ageWeeks: number): 'PRE_PONTE' | 'PONTE' | 'POST_PONTE' {
  if (ageWeeks < 20) return 'PRE_PONTE';
  if (ageWeeks <= 72) return 'PONTE'; // ~18 mois de production
  return 'POST_PONTE';
}

/**
 * Vérifie si le lot peut produire des œufs
 * @param lot Le lot à vérifier
 * @returns true si le lot est en phase ponte et actif
 */
function canLotProduce(lot: Lot): boolean {
  if (lot.status !== 'ACTIF') return false;
  const ageWeeks = calculateLotAgeWeeks(lot.hatchDate);
  return ageWeeks >= 20 && ageWeeks <= 72;
}

/**
 * Parse et valide une date d'éclosion
 * Accepte: "2026-03-18", "2026-03-18T10:30:00Z", new Date()
 * @param dateInput String (ISO) ou objet Date
 * @returns Date validée et parsée
 */
function parseDateInput(dateInput: any): Date {
  if (!dateInput) {
    throw new Error('Date d\'éclosion requise');
  }

  let date: Date;
  
  // Si c'est une string, la parser
  if (typeof dateInput === 'string') {
    // Accepte les formats: "2026-03-18" ou "2026-03-18T10:30:00Z"
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    // Si c'est déjà une Date, l'utiliser directement
    date = dateInput;
  } else {
    throw new Error('Date d\'éclosion invalide: doit être string ("YYYY-MM-DD") ou Date');
  }

  // Vérifier que la date est valide
  if (isNaN(date.getTime())) {
    throw new Error('Date d\'éclosion invalide: format incorrect. Utilisez "YYYY-MM-DD"');
  }

  // Vérifier que la date n'est pas dans le futur
  const now = new Date();
  if (date > now) {
    throw new Error('Date d\'éclosion ne peut pas être dans le futur');
  }

  // Vérifier que la date n'est pas trop ancienne (max 5 ans)
  const maxAgeMs = 5 * 365 * 24 * 60 * 60 * 1000;
  const ageMs = now.getTime() - date.getTime();
  if (ageMs > maxAgeMs) {
    throw new Error('Date d\'éclosion: lot trop ancien (> 5 ans)');
  }

  return date;
}

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
  
  // Valider et parser la date d'éclosion
  const parsedDate = parseDateInput(data.hatchDate);
  
  // Créer le lot avec la date parsée
  const createData: CreateLotDTO = {
    ...data,
    hatchDate: parsedDate
  };
  
  return lotRepository.create(createData);
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

// ============================================================================
// EXPORTS DES UTILITAIRES (pour usage dans autres services)
// ============================================================================

export {
  calculateLotAgeWeeks,
  determineLayingStage,
  canLotProduce,
  parseDateInput
};
