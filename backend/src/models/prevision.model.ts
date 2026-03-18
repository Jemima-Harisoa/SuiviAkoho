export interface Prevision {
  previsionId: number;
  lotId: number | null;
  category: string;
  description: string;
  plannedDate: Date;
  plannedAmountAr: number;
  status: string;
  realizedDate: Date | null;
  realizedAmountAr: number | null;
  varianceAr: number | null;
  notes: string | null;
  createdAt: Date;
}

export interface CreatePrevisionDto {
  lotId?: number | null;
  category: string;
  description: string;
  plannedDate: Date | string;
  plannedAmountAr: number;
  status?: string;
  notes?: string | null;
}

export interface UpdatePrevisionDto {
  lotId?: number | null;
  category?: string;
  description?: string;
  plannedDate?: Date | string;
  plannedAmountAr?: number;
  status?: string;
  realizedDate?: Date | string | null;
  realizedAmountAr?: number | null;
  notes?: string | null;
}
