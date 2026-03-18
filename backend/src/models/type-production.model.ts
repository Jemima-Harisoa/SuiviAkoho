export interface TypeProduction {
  typeProductionId: number;
  code: string;
  label: string;
  sexeId: number | null;
}

export interface CreateTypeProductionDTO {
  code: string;
  label: string;
  sexeId?: number | null;
}
