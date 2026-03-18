export interface SuiviOeuf {
  suiviOeufId: number;
  lotId: number;
  week: number;
  eggsPerDay: number;
  eggsPerWeek: number;
  layingRatePct: number;
  weeklyRevenueAr: number | null;
  createdAt: Date;
}

export interface CreateSuiviOeufDTO {
  lotId: number;
  week: number;
  eggsPerDay: number;
  eggsPerWeek: number;
  layingRatePct: number;
  weeklyRevenueAr?: number | null;
}

export interface UpdateSuiviOeufDTO {
  eggsPerDay?: number;
  eggsPerWeek?: number;
  layingRatePct?: number;
  weeklyRevenueAr?: number | null;
}
