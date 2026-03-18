import * as sexeRepository from '../repositories/sexe.repository';
import { Sexe, CreateSexeDTO } from '../models/sexe.model';

/**
 * Service Sexe - Logique métier pour la gestion des sexes de poulets
 */

export async function getAllSexes(): Promise<Sexe[]> {
  return sexeRepository.findAll();
}

export async function getSexeById(sexeId: number): Promise<Sexe | null> {
  if (!sexeId || sexeId <= 0) {
    throw new Error('ID de sexe invalide');
  }
  return sexeRepository.findById(sexeId);
}

export async function getSexeByCode(code: string): Promise<Sexe | null> {
  if (!code || code.trim().length === 0) {
    throw new Error('Code de sexe requis');
  }
  return sexeRepository.findByCode(code);
}

export async function createSexe(data: CreateSexeDTO): Promise<Sexe> {
  // Validation
  if (!data.code || data.code.trim().length === 0) {
    throw new Error('Code de sexe requis');
  }
  if (!data.label || data.label.trim().length === 0) {
    throw new Error('Label de sexe requis');
  }

  // Vérifier l'unicité du code
  const existing = await sexeRepository.findByCode(data.code);
  if (existing) {
    throw new Error(`Un sexe avec le code "${data.code}" existe déjà`);
  }

  return sexeRepository.create(data);
}
