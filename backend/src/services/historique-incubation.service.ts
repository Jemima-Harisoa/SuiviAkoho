import * as historiqueRepository from '../repositories/historique-incubation.repository';
import * as incubationRepository from '../repositories/incubation.repository';
import * as lotRepository from '../repositories/lot.repository';
import { HistoriqueIncubation, CreateHistoriqueIncubationDTO, UpdateHistoriqueIncubationDTO } from '../models/historique-incubation.model';
import { Incubation } from '../models/incubation.model';

const ValidIncubatorTypes = ['NATUREL', 'MODERNE'];

type CreateHistoriqueIncubationInput = CreateHistoriqueIncubationDTO & {
  dateEntree?: Date | string;
  startDate?: Date | string;
  expectedHatchDate?: Date | string;
  actualHatchDate?: Date | string;
  hatchedCount?: number;
  createdLotId?: number;
  lotSourceId?: number;
  eventType?: string;
  lostEggsCount?: number;
};

function isValidDate(value: unknown): boolean {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function parseDate(value?: Date | string): Date | null {
  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    return isValidDate(parsed) ? parsed : null;
  }

  return null;
}

function normalizeDate(data: CreateHistoriqueIncubationInput): Date {
  const dateEntree = parseDate(data.dateEntree);
  const actualHatchDate = parseDate(data.actualHatchDate);
  const expectedHatchDate = parseDate(data.expectedHatchDate);
  const startDate = parseDate(data.startDate);

  return dateEntree ?? actualHatchDate ?? expectedHatchDate ?? startDate ?? new Date();
}

function normalizeIncubatorType(value?: string | null): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
}

async function syncMainIncubation(
  incubationId: number,
  data: { eggsHatchedCount?: number | null; createdLotId?: number }
): Promise<void> {
  const payload: { hatchedCount?: number; createdLotId?: number } = {};

  if (data.eggsHatchedCount !== undefined && data.eggsHatchedCount !== null) {
    payload.hatchedCount = data.eggsHatchedCount;
  }
  if (data.createdLotId !== undefined) {
    payload.createdLotId = data.createdLotId;
  }

  if (Object.keys(payload).length > 0) {
    await incubationRepository.update(incubationId, payload);
  }
}

function toSqlDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function resolveCreatedLotForIncubation(
  incubation: Incubation,
  requestedCreatedLotId: number | undefined,
  dateEntree: Date,
  eggsHatchedCount: number | null | undefined
): Promise<number | undefined> {
  const sourceLotId = incubation.sourceLotId;
  if (!sourceLotId) {
    if (requestedCreatedLotId !== undefined) {
      const requestedLot = await lotRepository.findById(requestedCreatedLotId);
      if (!requestedLot) {
        throw new Error(`Lot créé non trouvé (createdLotId=${requestedCreatedLotId})`);
      }
      return requestedLot.lotId;
    }

    return incubation.createdLotId ?? undefined;
  }

  const sourceLot = await lotRepository.findById(sourceLotId);
  if (!sourceLot) {
    throw new Error(`Lot source non trouvé (sourceLotId=${sourceLotId})`);
  }

  const validateLotCoherence = (lotRaceId: number, lotTypeProductionId: number): void => {
    if (lotRaceId !== sourceLot.raceId) {
      throw new Error('Le lot d\'éclosion doit avoir la même race que le lot mère');
    }
    if (lotTypeProductionId !== sourceLot.typeProductionId) {
      throw new Error('Le lot d\'éclosion doit garder le même type de production que le lot mère');
    }
  };

  if (requestedCreatedLotId !== undefined) {
    if (requestedCreatedLotId > 0) {
      const requestedLot = await lotRepository.findById(requestedCreatedLotId);
      if (requestedLot) {
        validateLotCoherence(requestedLot.raceId, requestedLot.typeProductionId);
        return requestedLot.lotId;
      }
    }
  }

  if (incubation.createdLotId) {
    const existingCreatedLot = await lotRepository.findById(incubation.createdLotId);
    if (existingCreatedLot) {
      validateLotCoherence(existingCreatedLot.raceId, existingCreatedLot.typeProductionId);
      return existingCreatedLot.lotId;
    }
  }

  if (!eggsHatchedCount || eggsHatchedCount <= 0) {
    return undefined;
  }

  const lotCode = `HATCH-AUTO-${Date.now()}`;
  const newLot = await lotRepository.create({
    lotCode,
    raceId: sourceLot.raceId,
    typeProductionId: sourceLot.typeProductionId,
    hatchDate: toSqlDateOnly(dateEntree),
    initialCount: eggsHatchedCount,
    maleCount: 0,
    femaleCount: 0,
    status: 'ACTIF',
    purchaseValue: null
  });

  return newLot.lotId;
}

export async function getAllHistoriqueIncubation(): Promise<HistoriqueIncubation[]> {
  return historiqueRepository.findAll();
}

export async function getHistoriqueIncubationByIncubation(incubationId: number): Promise<HistoriqueIncubation[]> {
  if (incubationId <= 0) throw new Error('IncubationId doit être positif');
  
  const incubation = await incubationRepository.findById(incubationId);
  if (!incubation) throw new Error(`Incubation non trouvée`);
  
  return historiqueRepository.findByIncubation(incubationId);
}

export async function getHistoriqueIncubationByDateRange(startDate: Date, endDate: Date): Promise<HistoriqueIncubation[]> {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    throw new Error('Les dates doivent être des objets Date valides');
  }
  if (startDate > endDate) {
    throw new Error('La date de début doit être antérieure à la date de fin');
  }
  
  return historiqueRepository.findByDateRange(startDate, endDate);
}

export async function getHistoriqueIncubationById(historiqueId: number): Promise<HistoriqueIncubation> {
  if (historiqueId <= 0) throw new Error('HistoriqueId doit être positif');
  
  const historique = await historiqueRepository.findById(historiqueId);
  if (!historique) throw new Error(`Historique incubation non trouvé`);
  
  return historique;
}

export async function createHistoriqueIncubation(data: CreateHistoriqueIncubationInput): Promise<HistoriqueIncubation> {
  const dateEntree = normalizeDate(data);
  const incubatorType = normalizeIncubatorType(data.incubatorType);
  const eggsSetCount = data.eggsSetCount;
  const eggsHatchedCount = data.eggsHatchedCount ?? data.hatchedCount;
  const lostEggsCount = data.lostEggsCount;

  let hatchRatePct = data.hatchRatePct;
  if (
    (hatchRatePct === undefined || hatchRatePct === null) &&
    eggsSetCount !== undefined && eggsSetCount !== null && eggsSetCount > 0 &&
    eggsHatchedCount !== undefined && eggsHatchedCount !== null
  ) {
    hatchRatePct = (eggsHatchedCount * 100) / eggsSetCount;
  }

  const requestedCreatedLotId = data.createdLotId;

  // Validation de l'incubation
  if (data.incubationId <= 0) throw new Error('IncubationId doit être positif');
  const incubation = await incubationRepository.findById(data.incubationId);
  if (!incubation) throw new Error(`Incubation non trouvée`);

  // Validation du type incubateur
  if (incubatorType !== undefined && incubatorType !== null) {
    if (!ValidIncubatorTypes.includes(incubatorType)) {
      throw new Error(`Type incubateur invalide. Valeurs acceptées: ${ValidIncubatorTypes.join(', ')}`);
    }
  }

  // Validation des œufs
  if (eggsSetCount !== undefined && eggsSetCount !== null && eggsSetCount <= 0) {
    throw new Error('EggsSetCount doit être > 0');
  }
  if (eggsHatchedCount !== undefined && eggsHatchedCount !== null && eggsHatchedCount < 0) {
    throw new Error('EggsHatchedCount doit être >= 0');
  }
  if (lostEggsCount !== undefined && lostEggsCount !== null && lostEggsCount < 0) {
    throw new Error('lostEggsCount doit être >= 0');
  }

  // Validation - œufs éclos ne peut pas dépasser les œufs mis en place
  if (eggsSetCount && eggsHatchedCount && eggsHatchedCount > eggsSetCount) {
    throw new Error('Le nombre d\'œufs éclos ne peut pas dépasser le nombre d\'œufs mis en place');
  }
  if (
    eggsSetCount &&
    eggsHatchedCount !== undefined && eggsHatchedCount !== null &&
    lostEggsCount !== undefined && lostEggsCount !== null &&
    eggsHatchedCount + lostEggsCount > eggsSetCount
  ) {
    throw new Error('Le total œufs éclos + œufs perdus ne peut pas dépasser eggsSetCount');
  }

  if (
    eggsHatchedCount !== undefined && eggsHatchedCount !== null &&
    incubation.eggsSetCount !== undefined && incubation.eggsSetCount !== null &&
    eggsHatchedCount > incubation.eggsSetCount
  ) {
    throw new Error(`Le nombre d'œufs éclos ne peut pas dépasser ${incubation.eggsSetCount}`);
  }

  // Validation du pourcentage d'éclosion (0-100)
  if (hatchRatePct !== undefined && hatchRatePct !== null) {
    if (hatchRatePct < 0 || hatchRatePct > 100) {
      throw new Error('HatchRatePct doit être entre 0 et 100');
    }
  }

  const existingOnSameDate = await historiqueRepository.findByIncubationAndDate(
    data.incubationId,
    dateEntree
  );

  const normalizedNotes =
    lostEggsCount !== undefined && lostEggsCount !== null
      ? `${data.notes ?? ''}${data.notes ? ' | ' : ''}Pertes incubation: ${lostEggsCount}`
      : data.notes;

  const resolvedCreatedLotId = await resolveCreatedLotForIncubation(
    incubation,
    requestedCreatedLotId,
    dateEntree,
    eggsHatchedCount
  );

  if (resolvedCreatedLotId !== undefined && eggsHatchedCount !== undefined && eggsHatchedCount !== null && eggsHatchedCount > 0) {
    await lotRepository.update(resolvedCreatedLotId, { initialCount: eggsHatchedCount });
  }

  if (existingOnSameDate) {
    const updated = await historiqueRepository.update(existingOnSameDate.historiqueIncubationId, {
      incubatorType,
      eggsSetCount,
      eggsHatchedCount,
      hatchRatePct,
      notes: normalizedNotes
    });

    await syncMainIncubation(data.incubationId, {
      eggsHatchedCount,
      createdLotId: resolvedCreatedLotId
    });
    return updated;
  }

  try {
    const created = await historiqueRepository.create({
      incubationId: data.incubationId,
      dateEntree,
      incubatorType,
      eggsSetCount,
      eggsHatchedCount,
      hatchRatePct,
      notes: normalizedNotes
    });

    await syncMainIncubation(data.incubationId, {
      eggsHatchedCount,
      createdLotId: resolvedCreatedLotId
    });
    return created;
  } catch (error: any) {
    const isDuplicateDate =
      typeof error?.message === 'string' && error.message.includes('UQ_HistoIncubation_Date');

    if (!isDuplicateDate) {
      throw error;
    }

    const existingAfterRace = await historiqueRepository.findByIncubationAndDate(
      data.incubationId,
      dateEntree
    );

    if (!existingAfterRace) {
      throw error;
    }

    const updated = await historiqueRepository.update(existingAfterRace.historiqueIncubationId, {
      incubatorType,
      eggsSetCount,
      eggsHatchedCount,
      hatchRatePct,
      notes: normalizedNotes
    });

    await syncMainIncubation(data.incubationId, {
      eggsHatchedCount,
      createdLotId: resolvedCreatedLotId
    });
    return updated;
  }
}

export async function updateHistoriqueIncubation(historiqueId: number, data: UpdateHistoriqueIncubationDTO): Promise<HistoriqueIncubation> {
  // Vérifier que l'historique existe
  const current = await historiqueRepository.findById(historiqueId);
  if (!current) throw new Error(`Historique incubation non trouvé`);
  
  // Validation du type incubateur
  if (data.incubatorType !== undefined && data.incubatorType !== null) {
    if (!ValidIncubatorTypes.includes(data.incubatorType)) {
      throw new Error(`Type incubateur invalide. Valeurs acceptées: ${ValidIncubatorTypes.join(', ')}`);
    }
  }
  
  // Validation des œufs
  if (data.eggsSetCount !== undefined && data.eggsSetCount !== null && data.eggsSetCount <= 0) {
    throw new Error('EggsSetCount doit être > 0');
  }
  if (data.eggsHatchedCount !== undefined && data.eggsHatchedCount !== null && data.eggsHatchedCount < 0) {
    throw new Error('EggsHatchedCount doit être >= 0');
  }
  
  // Validation - œufs éclos ne peut pas dépasser les œufs mis en place
  if (data.eggsSetCount && data.eggsHatchedCount && data.eggsHatchedCount > data.eggsSetCount) {
    throw new Error('Le nombre d\'œufs éclos ne peut pas dépasser le nombre d\'œufs mis en place');
  }
  
  // Validation du pourcentage d'éclosion (0-100)
  if (data.hatchRatePct !== undefined && data.hatchRatePct !== null) {
    if (data.hatchRatePct < 0 || data.hatchRatePct > 100) {
      throw new Error('HatchRatePct doit être entre 0 et 100');
    }
  }
  
  const updated = await historiqueRepository.update(historiqueId, data);

  await syncMainIncubation(updated.incubationId, {
    eggsHatchedCount: data.eggsHatchedCount
  });

  return updated;
}

export async function deleteHistoriqueIncubation(historiqueId: number): Promise<void> {
  const current = await historiqueRepository.findById(historiqueId);
  if (!current) throw new Error(`Historique incubation non trouvé`);
  
  await historiqueRepository.delete_(historiqueId);
}
