export interface SuiviPoulet {
  suiviPouletId: number;
  lotId: number;
  week: number;
  averageWeightG: number;
  rationGPerDay: number;
  suppliedRationG: number;
  costPerAr: number;
  mortality: number;
  soldCount: number;
  notes: string | null;
  recordedAt: Date;
}

export interface CreateSuiviPouletDTO {
  lotId: number;
  week: number;
  averageWeightG: number;
  rationGPerDay: number;
  suppliedRationG: number;
  costPerAr: number;
  mortality: number;
  soldCount: number;
  notes?: string;
}

export interface UpdateSuiviPouletDTO {
  averageWeightG?: number;
  rationGPerDay?: number;
  suppliedRationG?: number;
  costPerAr?: number;
  mortality?: number;
  soldCount?: number;
  notes?: string;
}
