import * as phaseAlimentationRepository from '../repositories/phase-alimentation.repository';
import { PhaseAlimentation, CreatePhaseAlimentationDTO } from '../models/phase-alimentation.model';

/**
 * Service PhaseAlimentation - Logique métier pour la gestion des phases d'alimentation
 */

export async function getAllPhases(): Promise<PhaseAlimentation[]> {
  return phaseAlimentationRepository.findAll();
}

export async function getPhaseById(phaseId: number): Promise<PhaseAlimentation | null> {
  if (!phaseId || phaseId <= 0) {
    throw new Error('ID de phase invalide');
  }
  return phaseAlimentationRepository.findById(phaseId);
}

export async function getPhaseByCode(code: string): Promise<PhaseAlimentation | null> {
  if (!code || code.trim().length === 0) {
    throw new Error('Code de phase requis');
  }
  return phaseAlimentationRepository.findByCode(code);
}

export async function createPhase(data: CreatePhaseAlimentationDTO): Promise<PhaseAlimentation> {
  // Validation
  if (!data.code || data.code.trim().length === 0) {
    throw new Error('Code de phase requis');
  }
  if (!data.label || data.label.trim().length === 0) {
    throw new Error('Label de phase requis');
  }
  if (data.weekFrom === undefined || data.weekFrom === null) {
    throw new Error('Semaine début requise');
  }
  if (data.weekTo === undefined || data.weekTo === null) {
    throw new Error('Semaine fin requise');
  }
  if (data.rationMinGPerDay === undefined || data.rationMinGPerDay === null) {
    throw new Error('Ration minimum requise');
  }
  if (data.rationMaxGPerDay === undefined || data.rationMaxGPerDay === null) {
    throw new Error('Ration maximum requise');
  }

  // Validations métier
  if (data.weekFrom < 0 || data.weekTo < 0) {
    throw new Error('Les semaines doivent être positives');
  }
  if (data.weekFrom > data.weekTo) {
    throw new Error('La semaine de début ne peut pas être après la semaine de fin');
  }
  if (data.rationMinGPerDay > data.rationMaxGPerDay) {
    throw new Error('La ration minimum ne peut pas être supérieure à la ration maximum');
  }

  // Vérifier l'unicité du code
  const existing = await phaseAlimentationRepository.findByCode(data.code);
  if (existing) {
    throw new Error(`Une phase avec le code "${data.code}" existe déjà`);
  }

  return phaseAlimentationRepository.create(data);
}
