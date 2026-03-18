export interface PhaseAlimentation {
  phaseAlimentationId: number;
  code: string;
  label: string;
  weekFrom: number;
  weekTo: number;
  rationMinGPerDay: number;
  rationMaxGPerDay: number;
  objective: string | null;
  raceId: number | null;
  typeProductionId: number | null;
}

export interface CreatePhaseAlimentationDTO {
  code: string;
  label: string;
  weekFrom: number;
  weekTo: number;
  rationMinGPerDay: number;
  rationMaxGPerDay: number;
  objective?: string | null;
  raceId?: number | null;
  typeProductionId?: number | null;
}
