export interface Race{
    raceId: number;
    name: string;
    descriptionJson: Record<string, any>;
    createdAt: Date;
}

export interface CreateRaceDTO {
    name: string;
    descriptionJson: Record<string, any> | null;
}