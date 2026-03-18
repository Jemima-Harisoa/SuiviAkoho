export interface HistoriqueSuiviOeuf {
  historiqueSuiviOeufId: number;
  suiviOeufId: number;
  dateEntree: Date;
  eggsPerDay: number | null;
  eggsPerWeek: number | null;
  layingRatePct: number | null;
  weeklyRevenueAr: number | null;
  notes: string | null;
  createdAt: Date;
}

export interface CreateHistoriqueSuiviOeufDTO {
  suiviOeufId: number;
  dateEntree: Date;
  eggsPerDay?: number | null;
  eggsPerWeek?: number | null;
  layingRatePct?: number | null;
  weeklyRevenueAr?: number | null;
  notes?: string | null;
}

export interface UpdateHistoriqueSuiviOeufDTO {
  eggsPerDay?: number | null;
  eggsPerWeek?: number | null;
  layingRatePct?: number | null;
  weeklyRevenueAr?: number | null;
  notes?: string | null;
}
