import * as venteService from './vente.service';
import { CreateHistoriqueVenteDto, HistoriqueVente } from '../models/historique-gain.model';

export async function getAllHistoriqueGains(): Promise<HistoriqueVente[]> {
  return venteService.getAllVentes();
}

export async function getChiffreAffaires(startDate?: Date, endDate?: Date): Promise<number> {
  return venteService.getChiffreAffaires(startDate, endDate);
}

export async function createHistoriqueGain(data: CreateHistoriqueVenteDto): Promise<HistoriqueVente> {
  return venteService.createVente(data);
}
