export interface Lot {
  lotId: number;
  lotCode: string;
  raceId: number;
  typeProductionId: number;
  sexeId: number | null;
  startDate: Date;
  initialCount: number;
  maleCount: number;
  femaleCount: number;
  status: 'ACTIF' | 'CLOTURE' | 'ANNULE';
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLotDTO {
  lotCode: string;
  raceId: number;
  typeProductionId: number;
  sexeId?: number | null;
  startDate: Date;
  initialCount: number;
  maleCount: number;
  femaleCount: number;
  notes?: string;
}

export interface UpdateLotDTO {
  raceId?: number;
  typeProductionId?: number;
  sexeId?: number | null;
  initialCount?: number;
  maleCount?: number;
  femaleCount?: number;
  status?: 'ACTIF' | 'CLOTURE' | 'ANNULE';
  notes?: string;
}
