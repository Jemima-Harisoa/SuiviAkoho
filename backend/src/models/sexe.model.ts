export interface Sexe {
  sexeId: number;
  code: string;
  label: string;
}

export interface CreateSexeDTO {
  code: string;
  label: string;
}
