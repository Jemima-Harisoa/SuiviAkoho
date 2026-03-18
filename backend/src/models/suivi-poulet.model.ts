export interface SuiviPoulet {
  suiviPouletId: number;
  lotId: number;
  week: number;
  remainingCount: number;
  avgWeightG: number | null;
  feedTotalKg: number | null;
  feedCostAr: number | null;
  createdAt: Date;
}

export interface CreateSuiviPouletDTO {
  lotId: number;
  week: number;
  remainingCount?: number;
  avgWeightG?: number | null;
  feedTotalKg?: number | null;
  feedCostAr?: number | null;
}

export interface UpdateSuiviPouletDTO {
  remainingCount?: number;
  avgWeightG?: number | null;
  feedTotalKg?: number | null;
  feedCostAr?: number | null;
}
