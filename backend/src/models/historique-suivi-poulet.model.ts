export type HistoriqueSuiviPouletEventType =
  | 'WEEK_OBSERVATION'
  | 'MORTALITE'
  | 'VENTE'
  | 'FINAL_COUNT'
  | 'TRAITEMENT_MEDICAL'
  | 'ANOMALIE';

export interface HistoriqueSuiviPoulet {
  historiqueSuiviPouletId: number;
  suiviPouletId: number;
  lotId?: number;
  weekNumber?: number;
  dateEntree: Date;
  remainingCount: number | null;
  avgWeightG: number | null;
  feedTotalKg: number | null;
  feedCostAr: number | null;
  eventType?: HistoriqueSuiviPouletEventType;
  notes: string | null;
  createdAt: Date;
}

export interface CreateHistoriqueSuiviPouletDTO {
  suiviPouletId: number;
  dateEntree: Date;
  remainingCount?: number | null;
  avgWeightG?: number | null;
  feedTotalKg?: number | null;
  feedCostAr?: number | null;
  eventType?: HistoriqueSuiviPouletEventType;
  notes?: string | null;
}

export interface UpdateHistoriqueSuiviPouletDTO {
  remainingCount?: number | null;
  avgWeightG?: number | null;
  feedTotalKg?: number | null;
  feedCostAr?: number | null;
  notes?: string | null;
}
