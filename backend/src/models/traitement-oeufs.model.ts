export interface TraitementOeufs {
  traitementOeufsId: number;
  suiviOeufId: number;
  sourceLotId: number;
  processType: 'VENTE' | 'INCUBATION';
  eggCount: number;
  unitPriceAr: number | null;
  totalAmountAr: number | null;
  incubationId: number | null;
  createdAt: Date;
}

export interface CreateTraitementOeufsDTO {
  suiviOeufId: number;
  sourceLotId: number;
  processType: 'VENTE' | 'INCUBATION';
  eggCount: number;
  unitPriceAr?: number | null;
  incubationId?: number | null;
}
