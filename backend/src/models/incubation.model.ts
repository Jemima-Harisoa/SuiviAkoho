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
  raceId?: number; // Requis si sourceLotId n'est pas fourni
  typeProductionId?: number; // Requis si sourceLotId n'est pas fourni
}

export interface UpdateIncubationDTO {
  hatchedCount?: number;
  createdLotId?: number;
}
