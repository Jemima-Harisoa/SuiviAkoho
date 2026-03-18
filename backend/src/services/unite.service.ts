import * as uniteRepository from '../repositories/unite.repository';
import { Unite, CreateUniteDTO } from '../models/unite.model';

/**
 * Service Unite - Logique métier pour la gestion des unités de mesure
 */

export async function getAllUnites(): Promise<Unite[]> {
  return uniteRepository.findAll();
}

export async function getUniteById(uniteId: number): Promise<Unite | null> {
  if (!uniteId || uniteId <= 0) {
    throw new Error('ID d\'unité invalide');
  }
  return uniteRepository.findById(uniteId);
}

export async function getUniteByCode(code: string): Promise<Unite | null> {
  if (!code || code.trim().length === 0) {
    throw new Error('Code d\'unité requis');
  }
  return uniteRepository.findByCode(code);
}

export async function createUnite(data: CreateUniteDTO): Promise<Unite> {
  // Validation
  if (!data.code || data.code.trim().length === 0) {
    throw new Error('Code d\'unité requis');
  }
  if (!data.label || data.label.trim().length === 0) {
    throw new Error('Label d\'unité requis');
  }

  // Vérifier l'unicité du code
  const existing = await uniteRepository.findByCode(data.code);
  if (existing) {
    throw new Error(`Une unité avec le code "${data.code}" existe déjà`);
  }

  return uniteRepository.create(data);
}
