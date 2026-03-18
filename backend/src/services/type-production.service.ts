import * as typeProductionRepository from '../repositories/type-production.repository';
import { TypeProduction, CreateTypeProductionDTO } from '../models/type-production.model';

/**
 * Service TypeProduction - Logique métier pour la gestion des types de production
 */

export async function getAllTypeProductions(): Promise<TypeProduction[]> {
  return typeProductionRepository.findAll();
}

export async function getTypeProductionById(typeProductionId: number): Promise<TypeProduction | null> {
  if (!typeProductionId || typeProductionId <= 0) {
    throw new Error('ID de type de production invalide');
  }
  return typeProductionRepository.findById(typeProductionId);
}

export async function getTypeProductionByCode(code: string): Promise<TypeProduction | null> {
  if (!code || code.trim().length === 0) {
    throw new Error('Code de type de production requis');
  }
  return typeProductionRepository.findByCode(code);
}

export async function createTypeProduction(data: CreateTypeProductionDTO): Promise<TypeProduction> {
  // Validation
  if (!data.code || data.code.trim().length === 0) {
    throw new Error('Code de type de production requis');
  }
  if (!data.label || data.label.trim().length === 0) {
    throw new Error('Label de type de production requis');
  }

  // Vérifier l'unicité du code
  const existing = await typeProductionRepository.findByCode(data.code);
  if (existing) {
    throw new Error(`Un type de production avec le code "${data.code}" existe déjà`);
  }

  return typeProductionRepository.create(data);
}
