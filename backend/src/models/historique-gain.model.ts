export interface HistoriqueVente {
  historiqueVenteId: number;
  productionId: number;
  lotId: number | null;
  saleDate: Date;
  productType: string;
  quantity: number;
  unitPriceAr: number;
  totalAmountAr: number;
  estimatedCostAr: number | null;
  profitAr: number | null;
  customerName: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface CreateHistoriqueVenteDto {
  productionId: number;
  lotId?: number | null;
  saleDate?: Date | string;
  productType?: string;
  quantity: number;
  unitPriceAr?: number;
  estimatedCostAr?: number | null;
  customerName?: string | null;
  notes?: string | null;
}
