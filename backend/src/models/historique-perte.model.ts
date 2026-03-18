export interface HistoriqueAchat {
  historiqueAchatId: number;
  lotId: number | null;
  previsionId: number | null;
  purchaseDate: Date;
  category: string;
  itemName: string;
  quantity: number | null;
  unit: string | null;
  unitPriceAr: number | null;
  totalAmountAr: number | null;
  supplierName: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface CreateHistoriqueAchatDto {
  lotId?: number | null;
  previsionId?: number | null;
  purchaseDate?: Date | string;
  category: string;
  itemName: string;
  quantity?: number | null;
  unit?: string | null;
  unitPriceAr?: number | null;
  supplierName?: string | null;
  notes?: string | null;
}
