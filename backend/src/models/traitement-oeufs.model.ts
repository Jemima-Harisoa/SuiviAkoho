export interface TraitementOeufs {
  traitementId: number;
  suiviOeufId: number;
  treatmentType: 'VENTE' | 'INCUBATION';
  count: number;
  unitPrice: number | null;
  totalAmountAr: number | null;
  incubationId: number | null;
  createdAt: Date;
}

export interface CreateTraitementOeufsDTO {
  suiviOeufId: number;
  treatmentType: 'VENTE' | 'INCUBATION';
  count: number;
  unitPrice?: number | null;
  incubationId?: number | null;
}
