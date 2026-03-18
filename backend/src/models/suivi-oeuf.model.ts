export interface SuiviOeuf {
  suiviOeufId: number;
  lotId: number;
  week: number;
  eggsPerDay: number;
  eggsPerWeek: number;
  layingRatePct: number;
  notes: string | null;
  recordedAt: Date;
}

export interface CreateSuiviOeufDTO {
  lotId: number;
  week: number;
  eggsPerDay: number;
  eggsPerWeek: number;
  layingRatePct: number;
  notes?: string;
}

export interface UpdateSuiviOeufDTO {
  eggsPerDay?: number;
  eggsPerWeek?: number;
  layingRatePct?: number;
  notes?: string;
}
