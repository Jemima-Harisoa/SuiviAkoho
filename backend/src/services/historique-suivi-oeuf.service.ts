import * as historiqueRepository from '../repositories/historique-suivi-oeuf.repository';
import * as suiviOeufRepository from '../repositories/suivi-oeuf.repository';
import { HistoriqueSuiviOeuf, CreateHistoriqueSuiviOeufDTO, UpdateHistoriqueSuiviOeufDTO } from '../models/historique-suivi-oeuf.model';

type CreateHistoriqueSuiviOeufInput = CreateHistoriqueSuiviOeufDTO & {
  lotId?: number;
  weekNumber?: number;
  dateEntree?: Date | string;
  nombreOeufParJour?: number;
  txPonte?: number;
  oeufsPerduOuCasse?: number;
};

function isValidDate(value: unknown): boolean {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function normalizeDate(value?: Date | string): Date {
  if (value instanceof Date) {
    if (!isValidDate(value)) {
      throw new Error('DateEntree doit être une date valide');
    }
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!isValidDate(parsed)) {
      throw new Error('DateEntree doit être une date valide');
    }
    return parsed;
  }

  return new Date();
}

async function resolveSuiviOeufId(input: CreateHistoriqueSuiviOeufInput): Promise<number> {
  if (input.suiviOeufId && input.suiviOeufId > 0) {
    const suivi = await suiviOeufRepository.findById(input.suiviOeufId);
    if (!suivi) {
      throw new Error('Suivi oeuf non trouvé');
    }
    return input.suiviOeufId;
  }

  if (!input.lotId || input.lotId <= 0) {
    throw new Error('suiviOeufId ou lotId est requis');
  }
  if (input.weekNumber === undefined || input.weekNumber === null || input.weekNumber < 0) {
    throw new Error('weekNumber est requis et doit être >= 0 quand suiviOeufId est absent');
  }

  const suivi = await suiviOeufRepository.findByLotAndWeek(input.lotId, input.weekNumber);
  if (!suivi) {
    throw new Error('Suivi oeuf non trouvé pour ce lot et cette semaine');
  }

  return suivi.suiviOeufId;
}

async function syncMainSuiviOeuf(
  suiviOeufId: number,
  data: {
    eggsPerDay?: number | null;
    eggsPerWeek?: number | null;
    layingRatePct?: number | null;
    weeklyRevenueAr?: number | null;
  }
): Promise<void> {
  const payload: {
    eggsPerDay?: number;
    eggsPerWeek?: number;
    layingRatePct?: number;
    weeklyRevenueAr?: number;
  } = {};

  if (data.eggsPerDay !== undefined && data.eggsPerDay !== null) {
    payload.eggsPerDay = data.eggsPerDay;
  }
  if (data.eggsPerWeek !== undefined && data.eggsPerWeek !== null) {
    payload.eggsPerWeek = data.eggsPerWeek;
  }
  if (data.layingRatePct !== undefined && data.layingRatePct !== null) {
    payload.layingRatePct = data.layingRatePct;
  }
  if (data.weeklyRevenueAr !== undefined && data.weeklyRevenueAr !== null) {
    payload.weeklyRevenueAr = data.weeklyRevenueAr;
  }

  if (Object.keys(payload).length > 0) {
    await suiviOeufRepository.update(suiviOeufId, payload);
  }
}

export async function getAllHistoriqueSuiviOeuf(): Promise<HistoriqueSuiviOeuf[]> {
  return historiqueRepository.findAll();
}

export async function getHistoriqueSuiviOeufBySuiviOeuf(suiviOeufId: number): Promise<HistoriqueSuiviOeuf[]> {
  if (suiviOeufId <= 0) throw new Error('SuiviOeufId doit être positif');
  
  const suivi = await suiviOeufRepository.findById(suiviOeufId);
  if (!suivi) throw new Error(`Suivi oeuf non trouvé`);
  
  return historiqueRepository.findBySuiviOeuf(suiviOeufId);
}

export async function getHistoriqueSuiviOeufByDateRange(startDate: Date, endDate: Date): Promise<HistoriqueSuiviOeuf[]> {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    throw new Error('Les dates doivent être des objets Date valides');
  }
  if (startDate > endDate) {
    throw new Error('La date de début doit être antérieure à la date de fin');
  }
  
  return historiqueRepository.findByDateRange(startDate, endDate);
}

export async function getHistoriqueSuiviOeufById(historiqueId: number): Promise<HistoriqueSuiviOeuf> {
  if (historiqueId <= 0) throw new Error('HistoriqueId doit être positif');
  
  const historique = await historiqueRepository.findById(historiqueId);
  if (!historique) throw new Error(`Historique suivi oeuf non trouvé`);
  
  return historique;
}

export async function createHistoriqueSuiviOeuf(data: CreateHistoriqueSuiviOeufInput): Promise<HistoriqueSuiviOeuf> {
  const suiviOeufId = await resolveSuiviOeufId(data);
  const dateEntree = normalizeDate(data.dateEntree);

  const eggsPerDay = data.eggsPerDay ?? data.nombreOeufParJour;
  const layingRatePct = data.layingRatePct ?? data.txPonte;

  let eggsPerWeek = data.eggsPerWeek;
  if (eggsPerWeek === undefined || eggsPerWeek === null) {
    if (eggsPerDay !== undefined && eggsPerDay !== null) {
      const estimatedWeekly = Math.round(eggsPerDay * 7);
      const lost = data.oeufsPerduOuCasse ?? 0;
      eggsPerWeek = Math.max(estimatedWeekly - lost, 0);
    }
  }

  const weeklyRevenueAr = data.weeklyRevenueAr;

  // Validation du suivi oeuf
  if (suiviOeufId <= 0) throw new Error('SuiviOeufId doit être positif');
  const suivi = await suiviOeufRepository.findById(suiviOeufId);
  if (!suivi) throw new Error(`Suivi oeuf non trouvé`);

  // Validation des montants positifs
  if (eggsPerDay !== undefined && eggsPerDay !== null && eggsPerDay < 0) {
    throw new Error('EggsPerDay doit être >= 0');
  }
  if (eggsPerWeek !== undefined && eggsPerWeek !== null && eggsPerWeek < 0) {
    throw new Error('EggsPerWeek doit être >= 0');
  }
  // Validation du pourcentage (0-100)
  if (layingRatePct !== undefined && layingRatePct !== null) {
    if (layingRatePct < 0 || layingRatePct > 100) {
      throw new Error('LayingRatePct doit être entre 0 et 100');
    }
  }
  if (weeklyRevenueAr !== undefined && weeklyRevenueAr !== null && weeklyRevenueAr < 0) {
    throw new Error('Revenu hebdomadaire doit être >= 0');
  }
  
  const existingOnSameDate = await historiqueRepository.findBySuiviOeufAndDate(
    suiviOeufId,
    dateEntree
  );

  if (existingOnSameDate) {
    const updated = await historiqueRepository.update(existingOnSameDate.historiqueSuiviOeufId, {
      eggsPerDay,
      eggsPerWeek,
      layingRatePct,
      weeklyRevenueAr,
      notes: data.notes
    });

    await syncMainSuiviOeuf(suiviOeufId, {
      eggsPerDay,
      eggsPerWeek,
      layingRatePct,
      weeklyRevenueAr
    });

    return updated;
  }

  try {
    const created = await historiqueRepository.create({
      suiviOeufId,
      dateEntree,
      eggsPerDay,
      eggsPerWeek,
      layingRatePct,
      weeklyRevenueAr,
      notes: data.notes
    });

    await syncMainSuiviOeuf(suiviOeufId, {
      eggsPerDay,
      eggsPerWeek,
      layingRatePct,
      weeklyRevenueAr
    });

    return created;
  } catch (error: any) {
    const isDuplicateDate =
      typeof error?.message === 'string' && error.message.includes('UQ_HistoSuiviOeuf_Date');

    if (!isDuplicateDate) {
      throw error;
    }

    const existingAfterRace = await historiqueRepository.findBySuiviOeufAndDate(
      suiviOeufId,
      dateEntree
    );

    if (!existingAfterRace) {
      throw error;
    }

    const updated = await historiqueRepository.update(existingAfterRace.historiqueSuiviOeufId, {
      eggsPerDay,
      eggsPerWeek,
      layingRatePct,
      weeklyRevenueAr,
      notes: data.notes
    });

    await syncMainSuiviOeuf(suiviOeufId, {
      eggsPerDay,
      eggsPerWeek,
      layingRatePct,
      weeklyRevenueAr
    });

    return updated;
  }
}

export async function updateHistoriqueSuiviOeuf(historiqueId: number, data: UpdateHistoriqueSuiviOeufDTO): Promise<HistoriqueSuiviOeuf> {
  // Vérifier que l'historique existe
  const current = await historiqueRepository.findById(historiqueId);
  if (!current) throw new Error(`Historique suivi oeuf non trouvé`);
  
  // Validation des montants positifs
  if (data.eggsPerDay !== undefined && data.eggsPerDay !== null && data.eggsPerDay < 0) {
    throw new Error('EggsPerDay doit être >= 0');
  }
  if (data.eggsPerWeek !== undefined && data.eggsPerWeek !== null && data.eggsPerWeek < 0) {
    throw new Error('EggsPerWeek doit être >= 0');
  }
  // Validation du pourcentage (0-100)
  if (data.layingRatePct !== undefined && data.layingRatePct !== null) {
    if (data.layingRatePct < 0 || data.layingRatePct > 100) {
      throw new Error('LayingRatePct doit être entre 0 et 100');
    }
  }
  if (data.weeklyRevenueAr !== undefined && data.weeklyRevenueAr !== null && data.weeklyRevenueAr < 0) {
    throw new Error('Revenu hebdomadaire doit être >= 0');
  }
  
  const updated = await historiqueRepository.update(historiqueId, data);

  await syncMainSuiviOeuf(updated.suiviOeufId, {
    eggsPerDay: data.eggsPerDay,
    eggsPerWeek: data.eggsPerWeek,
    layingRatePct: data.layingRatePct,
    weeklyRevenueAr: data.weeklyRevenueAr
  });

  return updated;
}

export async function deleteHistoriqueSuiviOeuf(historiqueId: number): Promise<void> {
  const current = await historiqueRepository.findById(historiqueId);
  if (!current) throw new Error(`Historique suivi oeuf non trouvé`);
  
  await historiqueRepository.delete_(historiqueId);
}
