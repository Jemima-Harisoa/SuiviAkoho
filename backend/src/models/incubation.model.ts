export interface Incubation {
  incubationId: number;
  sourceLotId: number | null;
  incubatorType: string;
  startDate: Date;
  eggsSetCount: number;
  expectedHatchDate: Date;
  hatchedCount: number | null;
  hatchRatePct: number | null;
  createdLotId: number | null;
  createdAt: Date;
}

export interface CreateIncubationDTO {
  sourceLotId?: number | null;
  incubatorType: string;
  startDate: Date;
  eggsSetCount: number;
  createdLotId?: number | null;
}

export interface UpdateIncubationDTO {
  hatchedCount?: number;
  createdLotId?: number;
}
