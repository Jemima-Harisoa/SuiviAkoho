export interface Parametre {
  parametreId: number;
  code: string;
  label: string;
  value: string;
  effectiveDate: Date;
  endDate: Date | null;
}

export interface CreateParametreDTO {
  code: string;
  label: string;
  value: string;
  effectiveDate: string;
  endDate?: string | null;
}
