export interface HistoriqueIncubation {
  historiqueIncubationId: number;
  incubationId: number;
  dateEntree: Date;
  incubatorType: string | null;
  eggsSetCount: number | null;
  eggsHatchedCount: number | null;
  hatchRatePct: number | null;
  notes: string | null;
  createdAt: Date;
}

export interface CreateHistoriqueIncubationDTO {
  incubationId: number;
  dateEntree: Date;
  incubatorType?: string | null;
  eggsSetCount?: number | null;
  eggsHatchedCount?: number | null;
  hatchRatePct?: number | null;
  notes?: string | null;
}

export interface UpdateHistoriqueIncubationDTO {
  incubatorType?: string | null;
  eggsSetCount?: number | null;
  eggsHatchedCount?: number | null;
  hatchRatePct?: number | null;
  notes?: string | null;
}
