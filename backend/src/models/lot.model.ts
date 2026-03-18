export interface Lot {
  lotId: number;
  lotCode: string;
  raceId: number;
  typeProductionId: number;
  hatchDate: Date;
  initialCount: number;
  maleCount: number;
  femaleCount: number;
  status: 'ACTIF' | 'CLOTURE' | 'ANNULE';
  purchaseValue: number | null;
  createdAt: Date;
}

export interface CreateLotDTO {
  lotCode: string;
  raceId: number;
  typeProductionId: number;
  hatchDate: string | Date; // Accepte string ISO ou objet Date
  initialCount: number;
  maleCount: number;
  femaleCount: number;
  status?: 'ACTIF' | 'CLOTURE' | 'ANNULE';
  purchaseValue?: number | null;
}

export interface UpdateLotDTO {
  raceId?: number;
  typeProductionId?: number;
  initialCount?: number;
  maleCount?: number;
  femaleCount?: number;
  status?: 'ACTIF' | 'CLOTURE' | 'ANNULE';
  purchaseValue?: number;
}
