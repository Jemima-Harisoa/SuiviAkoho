export interface Race {
  raceId: number;
  name: string;
  descriptionJson: Record<string, any> | null;
  createdAt: Date;
}

export interface CreateRaceDTO {
  name: string;
  descriptionJson: Record<string, any> | null;
}
