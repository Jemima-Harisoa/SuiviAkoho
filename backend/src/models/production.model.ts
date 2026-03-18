export interface Production {
  productionId: number;
  lotId: number | null;
  productType: string;
  availableQuantity: number;
  unit: string;
  unitPriceAr: number | null;
  isActive: boolean;
  lastUpdateAt: Date;
  createdAt: Date;
}

export interface CreateProductionDto {
  lotId?: number | null;
  productType: string;
  availableQuantity: number;
  unit?: string;
  unitPriceAr?: number | null;
  isActive?: boolean;
}

export interface UpdateProductionDto {
  lotId?: number | null;
  productType?: string;
  availableQuantity?: number;
  unit?: string;
  unitPriceAr?: number | null;
  isActive?: boolean;
}
