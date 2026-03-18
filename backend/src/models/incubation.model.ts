export interface Incubation {
  incubationId: number;
  lotId: number | null;
  incubatorType: string;
  startDate: Date;
  eggsSetCount: number;
  expectedHatchDate: Date;
  hatchedCount: number | null;
  hatchRatePct: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIncubationDTO {
  lotId?: number | null;
  incubatorType: string;
  startDate: Date;
  eggsSetCount: number;
  notes?: string;
}

export interface UpdateIncubationDTO {
  hatchedCount?: number;
  notes?: string;
}
