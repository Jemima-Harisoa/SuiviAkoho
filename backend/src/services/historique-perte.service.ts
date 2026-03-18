import * as achatService from './achat.service';
import { CreateHistoriqueAchatDto, HistoriqueAchat } from '../models/historique-perte.model';

export async function getAllHistoriquePertes(): Promise<HistoriqueAchat[]> {
  return achatService.getAllAchats();
}

export async function getTotalDepenses(startDate?: Date, endDate?: Date): Promise<number> {
  return achatService.getTotalDepenses(startDate, endDate);
}

export async function createHistoriquePerte(data: CreateHistoriqueAchatDto): Promise<HistoriqueAchat> {
  return achatService.createAchat(data);
}
