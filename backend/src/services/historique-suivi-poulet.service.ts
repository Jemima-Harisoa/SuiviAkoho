import * as historiqueRepository from '../repositories/historique-suivi-poulet.repository';
import * as suiviPouletRepository from '../repositories/suivi-poulet.repository';
import * as lotRepository from '../repositories/lot.repository';
import {
  HistoriqueSuiviPoulet,
  CreateHistoriqueSuiviPouletDTO,
  UpdateHistoriqueSuiviPouletDTO,
  HistoriqueSuiviPouletEventType
} from '../models/historique-suivi-poulet.model';

type CreateHistoriqueSuiviPouletInput = CreateHistoriqueSuiviPouletDTO & {
  lotId?: number;
  weekNumber?: number;
  densiteActuelle?: number;
  poidsActuelle?: number;
  raionSemaine?: number;
  rationSemaine?: number;
  coutAliment?: number;
  valeurLotAr?: number;
  eventType?: string;
  dateEntree?: Date | string;
};

const ALLOWED_EVENT_TYPES: HistoriqueSuiviPouletEventType[] = [
  'WEEK_OBSERVATION',
  'MORTALITE',
  'VENTE',
  'FINAL_COUNT',
  'TRAITEMENT_MEDICAL',
  'ANOMALIE'
];

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

function normalizeEventType(value?: string): HistoriqueSuiviPouletEventType | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toUpperCase() as HistoriqueSuiviPouletEventType;
  if (!ALLOWED_EVENT_TYPES.includes(normalized)) {
    throw new Error(`eventType invalide. Valeurs autorisées: ${ALLOWED_EVENT_TYPES.join(', ')}`);
  }

  return normalized;
}

function inferEventType(
  current: HistoriqueSuiviPoulet,
  previous: HistoriqueSuiviPoulet | null,
  explicitEventType?: HistoriqueSuiviPouletEventType
): HistoriqueSuiviPouletEventType {
  if (explicitEventType) {
    return explicitEventType;
  }

  const notes = (current.notes ?? '').toLowerCase();
  if (notes.includes('vente') || notes.includes('vendu')) {
    return 'VENTE';
  }
  if (notes.includes('traitement') || notes.includes('medical') || notes.includes('médical')) {
    return 'TRAITEMENT_MEDICAL';
  }
  if (notes.includes('anomalie') || notes.includes('anomaly')) {
    return 'ANOMALIE';
  }

  if ((current.remainingCount ?? 0) === 0) {
    return 'FINAL_COUNT';
  }

  if (
    previous?.remainingCount !== null &&
    previous?.remainingCount !== undefined &&
    current.remainingCount !== null &&
    current.remainingCount !== undefined &&
    current.remainingCount < previous.remainingCount
  ) {
    return 'MORTALITE';
  }

  return 'WEEK_OBSERVATION';
}

function withComputedEventType(items: HistoriqueSuiviPoulet[]): HistoriqueSuiviPoulet[] {
  const groupedBySuivi = new Map<number, HistoriqueSuiviPoulet[]>();

  for (const item of items) {
    const group = groupedBySuivi.get(item.suiviPouletId) ?? [];
    group.push(item);
    groupedBySuivi.set(item.suiviPouletId, group);
  }

  const enriched: HistoriqueSuiviPoulet[] = [];
  for (const group of groupedBySuivi.values()) {
    const sorted = [...group].sort(
      (a, b) => new Date(a.dateEntree).getTime() - new Date(b.dateEntree).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      const previous = i > 0 ? sorted[i - 1] : null;
      const current = sorted[i];
      enriched.push({
        ...current,
        eventType: inferEventType(current, previous)
      });
    }
  }

  return enriched.sort(
    (a, b) => new Date(b.dateEntree).getTime() - new Date(a.dateEntree).getTime()
  );
}

async function resolveSuiviPouletId(input: CreateHistoriqueSuiviPouletInput): Promise<number> {
  if (input.suiviPouletId && input.suiviPouletId > 0) {
    const suivi = await suiviPouletRepository.findById(input.suiviPouletId);
    if (!suivi) {
      throw new Error('Suivi poulet non trouvé');
    }
    return input.suiviPouletId;
  }

  if (!input.lotId || input.lotId <= 0) {
    throw new Error('suiviPouletId ou lotId est requis');
  }
  if (input.weekNumber === undefined || input.weekNumber === null || input.weekNumber < 0) {
    throw new Error('weekNumber est requis et doit être >= 0 quand suiviPouletId est absent');
  }

  const suivi = await suiviPouletRepository.findByLotAndWeek(input.lotId, input.weekNumber);
  if (!suivi) {
    throw new Error('Suivi poulet non trouvé pour ce lot et cette semaine');
  }

  return suivi.suiviPouletId;
}

async function syncMainSuiviPoulet(
  suiviPouletId: number,
  data: {
    remainingCount?: number | null;
    avgWeightG?: number | null;
    feedTotalKg?: number | null;
    feedCostAr?: number | null;
  }
): Promise<void> {
  const payload: {
    remainingCount?: number;
    avgWeightG?: number | null;
    feedTotalKg?: number | null;
    feedCostAr?: number | null;
  } = {};

  if (data.remainingCount !== undefined && data.remainingCount !== null) {
    payload.remainingCount = data.remainingCount;
  }
  if (data.avgWeightG !== undefined) {
    payload.avgWeightG = data.avgWeightG;
  }
  if (data.feedTotalKg !== undefined) {
    payload.feedTotalKg = data.feedTotalKg;
  }
  if (data.feedCostAr !== undefined) {
    payload.feedCostAr = data.feedCostAr;
  }

  if (Object.keys(payload).length > 0) {
    await suiviPouletRepository.update(suiviPouletId, payload);
  }
}

export async function getAllHistoriqueSuiviPoulet(): Promise<HistoriqueSuiviPoulet[]> {
  const historiques = await historiqueRepository.findAll();
  return withComputedEventType(historiques);
}

export async function getHistoriqueSuiviPouletBySuiviPoulet(suiviPouletId: number): Promise<HistoriqueSuiviPoulet[]> {
  if (suiviPouletId <= 0) throw new Error('SuiviPouletId doit être positif');
  
  const suivi = await suiviPouletRepository.findById(suiviPouletId);
  if (!suivi) throw new Error(`Suivi poulet non trouvé`);
  
  const historiques = await historiqueRepository.findBySuiviPoulet(suiviPouletId);
  return withComputedEventType(historiques);
}

export async function getHistoriqueSuiviPouletByLot(lotId: number): Promise<HistoriqueSuiviPoulet[]> {
  if (lotId <= 0) throw new Error('LotId doit être positif');

  const lot = await lotRepository.findById(lotId);
  if (!lot) throw new Error('Lot non trouvé');

  const historiques = await historiqueRepository.findByLot(lotId);
  return withComputedEventType(historiques);
}

export async function getHistoriqueSuiviPouletByEventType(
  eventType: string
): Promise<HistoriqueSuiviPoulet[]> {
  const normalizedEventType = normalizeEventType(eventType);
  if (!normalizedEventType) {
    throw new Error('eventType est requis');
  }

  const historiques = await getAllHistoriqueSuiviPoulet();
  return historiques.filter((item) => item.eventType === normalizedEventType);
}

export async function getHistoriqueSuiviPouletByDateRange(startDate: Date, endDate: Date): Promise<HistoriqueSuiviPoulet[]> {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    throw new Error('Les dates doivent être des objets Date valides');
  }
  if (startDate > endDate) {
    throw new Error('La date de début doit être antérieure à la date de fin');
  }
  
  const historiques = await historiqueRepository.findByDateRange(startDate, endDate);
  return withComputedEventType(historiques);
}

export async function getHistoriqueSuiviPouletById(historiqueId: number): Promise<HistoriqueSuiviPoulet> {
  if (historiqueId <= 0) throw new Error('HistoriqueId doit être positif');
  
  const historique = await historiqueRepository.findById(historiqueId);
  if (!historique) throw new Error(`Historique suivi poulet non trouvé`);
  
  const historiques = await historiqueRepository.findBySuiviPoulet(historique.suiviPouletId);
  const currentWithEventType = withComputedEventType(historiques).find(
    (item) => item.historiqueSuiviPouletId === historiqueId
  );

  return currentWithEventType ?? historique;
}

export async function createHistoriqueSuiviPoulet(data: CreateHistoriqueSuiviPouletInput): Promise<HistoriqueSuiviPoulet> {
  const suiviPouletId = await resolveSuiviPouletId(data);
  const dateEntree = normalizeDate(data.dateEntree);
  const remainingCount = data.remainingCount ?? data.densiteActuelle;
  const avgWeightG = data.avgWeightG ?? data.poidsActuelle;
  const feedTotalKg = data.feedTotalKg ?? data.raionSemaine ?? data.rationSemaine;
  const feedCostAr = data.feedCostAr ?? data.coutAliment;
  const explicitEventType = normalizeEventType(data.eventType);

  // Validation du suivi poulet
  if (suiviPouletId <= 0) throw new Error('SuiviPouletId doit être positif');
  const suivi = await suiviPouletRepository.findById(suiviPouletId);
  if (!suivi) throw new Error(`Suivi poulet non trouvé`);

  // Validation des montants positifs
  if (remainingCount !== undefined && remainingCount !== null && remainingCount < 0) {
    throw new Error('RemainingCount doit être >= 0');
  }
  if (avgWeightG !== undefined && avgWeightG !== null && avgWeightG < 0) {
    throw new Error('Poids moyen doit être >= 0');
  }
  if (feedTotalKg !== undefined && feedTotalKg !== null && feedTotalKg < 0) {
    throw new Error('Aliments fournis doit être >= 0');
  }
  if (feedCostAr !== undefined && feedCostAr !== null && feedCostAr < 0) {
    throw new Error('Coût alimentation doit être >= 0');
  }

  const existingOnSameDate = await historiqueRepository.findBySuiviPouletAndDate(suiviPouletId, dateEntree);

  if (existingOnSameDate) {
    const updated = await historiqueRepository.update(existingOnSameDate.historiqueSuiviPouletId, {
      remainingCount,
      avgWeightG,
      feedTotalKg,
      feedCostAr,
      notes: data.notes
    });

    await syncMainSuiviPoulet(suiviPouletId, {
      remainingCount,
      avgWeightG,
      feedTotalKg,
      feedCostAr
    });

    const hydrated = await getHistoriqueSuiviPouletById(updated.historiqueSuiviPouletId);
    return {
      ...hydrated,
      eventType: explicitEventType ?? hydrated.eventType
    };
  }

  let created: HistoriqueSuiviPoulet;
  try {
    created = await historiqueRepository.create({
      suiviPouletId,
      dateEntree,
      remainingCount,
      avgWeightG,
      feedTotalKg,
      feedCostAr,
      eventType: explicitEventType,
      notes: data.notes
    });
  } catch (error: any) {
    const isDuplicateDate =
      typeof error?.message === 'string' && error.message.includes('UQ_HistoSuiviPoulet_Date');

    if (!isDuplicateDate) {
      throw error;
    }

    const existingAfterRace = await historiqueRepository.findBySuiviPouletAndDate(suiviPouletId, dateEntree);
    if (!existingAfterRace) {
      throw error;
    }

    const updated = await historiqueRepository.update(existingAfterRace.historiqueSuiviPouletId, {
      remainingCount,
      avgWeightG,
      feedTotalKg,
      feedCostAr,
      notes: data.notes
    });

    await syncMainSuiviPoulet(suiviPouletId, {
      remainingCount,
      avgWeightG,
      feedTotalKg,
      feedCostAr
    });

    const hydrated = await getHistoriqueSuiviPouletById(updated.historiqueSuiviPouletId);
    return {
      ...hydrated,
      eventType: explicitEventType ?? hydrated.eventType
    };
  }

  // Synchronise la table principale de suivi poulet avec les dernières données d'évolution.
  await syncMainSuiviPoulet(suiviPouletId, {
    remainingCount,
    avgWeightG,
    feedTotalKg,
    feedCostAr
  });

  const historiques = await historiqueRepository.findBySuiviPoulet(suiviPouletId);
  const normalized = withComputedEventType(historiques).find(
    (item) => item.historiqueSuiviPouletId === created.historiqueSuiviPouletId
  );

  return {
    ...created,
    eventType: normalized?.eventType ?? explicitEventType
  };
}

export async function updateHistoriqueSuiviPoulet(historiqueId: number, data: UpdateHistoriqueSuiviPouletDTO): Promise<HistoriqueSuiviPoulet> {
  // Vérifier que l'historique existe
  const current = await historiqueRepository.findById(historiqueId);
  if (!current) throw new Error(`Historique suivi poulet non trouvé`);
  
  // Validation des montants positifs
  if (data.remainingCount !== undefined && data.remainingCount !== null && data.remainingCount < 0) {
    throw new Error('RemainingCount doit être >= 0');
  }
  if (data.avgWeightG !== undefined && data.avgWeightG !== null && data.avgWeightG < 0) {
    throw new Error('Poids moyen doit être >= 0');
  }
  if (data.feedTotalKg !== undefined && data.feedTotalKg !== null && data.feedTotalKg < 0) {
    throw new Error('Aliments fournis doit être >= 0');
  }
  if (data.feedCostAr !== undefined && data.feedCostAr !== null && data.feedCostAr < 0) {
    throw new Error('Coût alimentation doit être >= 0');
  }
  
  const updated = await historiqueRepository.update(historiqueId, data);

  await syncMainSuiviPoulet(updated.suiviPouletId, {
    remainingCount: data.remainingCount,
    avgWeightG: data.avgWeightG,
    feedTotalKg: data.feedTotalKg,
    feedCostAr: data.feedCostAr
  });

  return getHistoriqueSuiviPouletById(updated.historiqueSuiviPouletId);
}

export async function deleteHistoriqueSuiviPoulet(historiqueId: number): Promise<void> {
  const current = await historiqueRepository.findById(historiqueId);
  if (!current) throw new Error(`Historique suivi poulet non trouvé`);
  
  await historiqueRepository.delete_(historiqueId);
}
