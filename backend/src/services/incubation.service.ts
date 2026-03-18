import * as incubationRepository from '../repositories/incubation.repository';
import * as lotRepository from '../repositories/lot.repository';
import { Incubation, CreateIncubationDTO, UpdateIncubationDTO } from '../models/incubation.model';

export async function getAllIncubations(): Promise<Incubation[]> {
  return incubationRepository.findAll();
}

export async function getIncubationById(incubationId: number): Promise<Incubation> {
  if (incubationId <= 0) throw new Error('IncubationId doit être positif');
  
  const incubation = await incubationRepository.findById(incubationId);
  if (!incubation) throw new Error(`Incubation non trouvée`);
  
  return incubation;
}

export async function getIncubationByLot(lotId: number): Promise<Incubation[]> {
  if (lotId <= 0) throw new Error('LotId doit être positif');
  
  const lot = await lotRepository.findById(lotId);
  if (!lot) throw new Error(`Lot non trouvé`);
  
  return incubationRepository.findByLot(lotId);
}

export async function getIncubationByDateRange(startDate: Date, endDate: Date): Promise<Incubation[]> {
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    throw new Error('Date de début invalide');
  }
  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    throw new Error('Date de fin invalide');
  }
  if (startDate > endDate) {
    throw new Error('Date de début doit être <= date de fin');
  }
  
  return incubationRepository.findByDateRange(startDate, endDate);
}

export async function createIncubation(data: CreateIncubationDTO): Promise<Incubation> {
  let raceId = data.raceId;
  let typeProductionId = data.typeProductionId;
  
  // Validation du lot source si fourni
  if (data.sourceLotId !== undefined && data.sourceLotId !== null && data.sourceLotId <= 0) {
    throw new Error('SourceLotId doit être positif');
  }
  
  if (data.sourceLotId) {
    // Si lot source fourni, copier race et type
    const lot = await lotRepository.findById(data.sourceLotId);
    if (!lot) throw new Error(`Lot source non trouvé`);
    raceId = lot.raceId;
    typeProductionId = lot.typeProductionId;
  } else {
    // Si pas de lot source, race et type sont requis
    if (!raceId || !typeProductionId) {
      throw new Error('Si aucun lot source n\'est spécifié, raceId et typeProductionId sont requis');
    }
  }
  
  // Validation type incubateur
  if (!data.incubatorType || data.incubatorType.trim().length === 0) {
    throw new Error('Type d\'incubateur requis');
  }
  
  const incubatorType = data.incubatorType.toUpperCase();
  const validTypes = ['NATUREL', 'MODERNE'];
  if (!validTypes.includes(incubatorType)) {
    throw new Error(`Type d'incubateur invalide. Doit être: ${validTypes.join(' ou ')}`);
  }
  
  // Validation et conversion date de démarrage
  let startDate: Date;
  if (typeof data.startDate === 'string') {
    startDate = new Date(data.startDate);
  } else if (data.startDate instanceof Date) {
    startDate = data.startDate;
  } else {
    throw new Error('Date de démarrage invalide');
  }
  
  if (isNaN(startDate.getTime())) {
    throw new Error('Date de démarrage invalide');
  }
  
  // Validation nombre d'œufs
  if (data.eggsSetCount <= 0) {
    throw new Error('Nombre d\'œufs à couver doit être > 0');
  }
  
  // Créer le lot qui accueillera les poussins éclos
  const hatchDate = new Date(startDate);
  hatchDate.setDate(hatchDate.getDate() + 21);
  const hatchDateString = hatchDate.toISOString().split('T')[0];
  
  const timestamp = new Date().getTime();
  const generatedLotCode = `HATCH-${timestamp}`;
  
  console.log(`Création du lot d'éclosion: ${generatedLotCode} pour la date ${hatchDateString}`);
  
  const createdLot = await lotRepository.create({
    lotCode: generatedLotCode,
    raceId: raceId!,
    typeProductionId: typeProductionId!,
    hatchDate: hatchDateString,
    initialCount: data.eggsSetCount, // Initialiser avec le nombre d'œufs à couver
    maleCount: 0,
    femaleCount: 0,
    status: 'ACTIF',
    purchaseValue: null
  });
  
  console.log(`Lot d'éclosion créé avec ID: ${createdLot.lotId}`);
  
  // Créer l'objet avec la date convertie, le type validé et createdLotId
  const incubationData = {
    ...data,
    startDate,
    incubatorType,
    createdLotId: createdLot.lotId
  };
  
  return incubationRepository.create(incubationData);
}

export async function updateIncubation(incubationId: number, data: UpdateIncubationDTO): Promise<Incubation> {
  const incubation = await incubationRepository.findById(incubationId);
  if (!incubation) throw new Error(`Incubation non trouvée`);
  
  // Validation nombre éclos si fourni
  if (data.hatchedCount !== undefined) {
    if (data.hatchedCount < 0) {
      throw new Error('Nombre d\'œufs éclos doit être >= 0');
    }
    if (data.hatchedCount > incubation.eggsSetCount) {
      throw new Error(`Nombre d'œufs éclos ne peut pas dépasser ${incubation.eggsSetCount}`);
    }
    
    // Mettre à jour l'initialCount du lot créé avec le nombre d'œufs éclos
    if (data.hatchedCount > 0 && incubation.createdLotId) {
      console.log(`Mise à jour du lot ${incubation.createdLotId} avec initialCount = ${data.hatchedCount}`);
      
      await lotRepository.update(incubation.createdLotId, {
        initialCount: data.hatchedCount
      });
      
      console.log(`Lot ${incubation.createdLotId} mis à jour avec ${data.hatchedCount} poussins`);
    }
  }
  
  // Validation CreatedLotId si fourni
  if (data.createdLotId !== undefined && data.createdLotId !== null) {
    if (data.createdLotId <= 0) {
      throw new Error('CreatedLotId doit être positif');
    }
    const lot = await lotRepository.findById(data.createdLotId);
    if (!lot) throw new Error(`Lot créé non trouvé`);
  }
  
  return incubationRepository.update(incubationId, data);
}

export async function deleteIncubation(incubationId: number): Promise<void> {
  const incubation = await incubationRepository.findById(incubationId);
  if (!incubation) throw new Error(`Incubation non trouvée`);
  
  await incubationRepository.delete$(incubationId);
}

/**
 * Calcule la date d'éclosion attendue (21 jours après le démarrage)
 * @param startDate Date de mise en couveuse
 * @returns Date d'éclosion attendue
 */
export function calculateExpectedHatchDate(startDate: Date): Date {
  const hatchDate = new Date(startDate);
  hatchDate.setDate(hatchDate.getDate() + 21);
  return hatchDate;
}

/**
 * Calcule le taux d'éclosion en pourcentage
 * @param hatchedCount Nombre d'œufs éclos
 * @param eggsSetCount Total d'œufs mis en couveuse
 * @returns Taux d'éclosion en pourcentage
 */
export function calculateHatchRate(hatchedCount: number, eggsSetCount: number): number {
  if (eggsSetCount === 0) return 0;
  return (hatchedCount / eggsSetCount) * 100;
}

/**
 * Vérifie si l'incubation est terminée (date actuelle >= date d'éclosion attendue)
 * @param expectedHatchDate Date d'éclosion attendue
 * @returns true si la couvaison est finie
 */
export function isHatchingFinished(expectedHatchDate: Date): boolean {
  return new Date() >= expectedHatchDate;
}
