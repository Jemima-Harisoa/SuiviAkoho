import * as compositionRepository from '../repositories/reference-composition-aliment.repository';
import { ReferenceCompositionAliment, CreateReferenceCompositionAlimentDTO } from '../models/reference-composition-aliment.model';

/**
 * Service ReferenceCompositionAliment - Logique métier pour la composition des aliments
 */

export async function getAllCompositions(): Promise<ReferenceCompositionAliment[]> {
  return compositionRepository.findAll();
}

export async function getCompositionById(id: number): Promise<ReferenceCompositionAliment | null> {
  if (!id || id <= 0) {
    throw new Error('ID de composition invalide');
  }
  return compositionRepository.findById(id);
}

export async function getCompositionByIngredient(ingredient: string): Promise<ReferenceCompositionAliment | null> {
  if (!ingredient || ingredient.trim().length === 0) {
    throw new Error('Nom d\'ingrédient requis');
  }
  return compositionRepository.findByIngredient(ingredient);
}

export async function createComposition(data: CreateReferenceCompositionAlimentDTO): Promise<ReferenceCompositionAliment> {
  // Validation
  if (!data.ingredient || data.ingredient.trim().length === 0) {
    throw new Error('Nom d\'ingrédient requis');
  }

  // Validations métier - pourcentages
  if (data.percentMin !== undefined && data.percentMin !== null) {
    if (data.percentMin < 0 || data.percentMin > 100) {
      throw new Error('Pourcentage minimum doit être entre 0 et 100');
    }
  }
  if (data.percentMax !== undefined && data.percentMax !== null) {
    if (data.percentMax < 0 || data.percentMax > 100) {
      throw new Error('Pourcentage maximum doit être entre 0 et 100');
    }
  }
  if (
    data.percentMin !== undefined && data.percentMin !== null &&
    data.percentMax !== undefined && data.percentMax !== null
  ) {
    if (data.percentMin > data.percentMax) {
      throw new Error('Le pourcentage minimum ne peut pas être supérieur au maximum');
    }
  }

  return compositionRepository.create(data);
}
