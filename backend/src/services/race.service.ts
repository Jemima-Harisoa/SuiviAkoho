import * as raceRepository from '../repositories/race.repositories';
import { Race, CreateRaceDTO } from '../models/race.models';

/**
 * Service Race - Logique métier pour la gestion des races de poulets
 */

export async function getAllRaces(): Promise<Race[]> {
  return raceRepository.findAll();
}

export async function getRaceById(raceId: number): Promise<Race | null> {
  if (!raceId || raceId <= 0) {
    throw new Error('ID de race invalide');
  }
  return raceRepository.findById(raceId);
}

export async function getRaceByName(name: string): Promise<Race | null> {
  if (!name || name.trim().length === 0) {
    throw new Error('Nom de race requis');
  }
  return raceRepository.findByName(name);
}

export async function createRace(data: CreateRaceDTO): Promise<Race> {
  // Validation
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Nom de race requis');
  }

  // Vérifier l'unicité du nom
  const existing = await raceRepository.findByName(data.name);
  if (existing) {
    throw new Error(`Une race avec le nom "${data.name}" existe déjà`);
  }

  // Valider le JSON si fourni
  if (data.descriptionJson) {
    try {
      JSON.stringify(data.descriptionJson);
    } catch {
      throw new Error('Description JSON invalide');
    }
  }

  return raceRepository.create(data);
}
