import * as parametreRepository from '../repositories/parametre.repository';
import { Parametre, CreateParametreDTO } from '../models/parametre.model';

/**
 * Service Parametre - Logique métier pour la gestion des paramètres système
 */

export async function getAllParametres(): Promise<Parametre[]> {
  return parametreRepository.findAll();
}

export async function getParametreById(parametreId: number): Promise<Parametre | null> {
  if (!parametreId || parametreId <= 0) {
    throw new Error('ID de paramètre invalide');
  }
  return parametreRepository.findById(parametreId);
}

export async function getParametreByCode(code: string): Promise<Parametre | null> {
  if (!code || code.trim().length === 0) {
    throw new Error('Code de paramètre requis');
  }
  return parametreRepository.findByCode(code);
}

export async function getActiveParametreByDate(code: string, date: Date): Promise<Parametre | null> {
  if (!code || code.trim().length === 0) {
    throw new Error('Code de paramètre requis');
  }
  if (!(date instanceof Date) && typeof date === 'string') {
    date = new Date(date);
  }
  if (isNaN(date.getTime())) {
    throw new Error('Date invalide');
  }
  return parametreRepository.findActiveByDate(code, date);
}

export async function createParametre(data: CreateParametreDTO): Promise<Parametre> {
  // Validation
  if (!data.code || data.code.trim().length === 0) {
    throw new Error('Code de paramètre requis');
  }
  if (!data.label || data.label.trim().length === 0) {
    throw new Error('Label de paramètre requis');
  }
  if (!data.value || data.value.trim().length === 0) {
    throw new Error('Valeur de paramètre requise');
  }

  // Valider dates
  if (!data.effectiveDate) {
    throw new Error('Date d\'effet requise');
  }

  let effectiveDate: Date;
  let endDate: Date | null = null;

  try {
    effectiveDate = new Date(data.effectiveDate);
    if (isNaN(effectiveDate.getTime())) {
      throw new Error('Date d\'effet invalide');
    }

    if (data.endDate) {
      endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error('Date de fin invalide');
      }
    }
  } catch {
    throw new Error('Format de date invalide (utilisez YYYY-MM-DD)');
  }

  // Validations métier
  if (endDate && effectiveDate > endDate) {
    throw new Error('La date d\'effet ne peut pas être après la date de fin');
  }

  // Vérifier l'unicité du code
  const existing = await parametreRepository.findByCode(data.code);
  if (existing) {
    throw new Error(`Un paramètre avec le code "${data.code}" existe déjà`);
  }

  return parametreRepository.create(data);
}
