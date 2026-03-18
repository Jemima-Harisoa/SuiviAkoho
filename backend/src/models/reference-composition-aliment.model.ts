export interface ReferenceCompositionAliment {
  referenceCompositionAlimentId: number;
  ingredient: string;
  percentMin: number | null;
  percentMax: number | null;
  notes: string | null;
  raceId: number | null;
  typeProductionId: number | null;
}

export interface CreateReferenceCompositionAlimentDTO {
  ingredient: string;
  percentMin?: number | null;
  percentMax?: number | null;
  notes?: string | null;
  raceId?: number | null;
  typeProductionId?: number | null;
}
