import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateRaceDTO, Race } from '../models/race.model';

@Injectable({
  providedIn: 'root',
})
export class RaceService {
  private apiUrl = 'http://localhost:3000/api/races';

  constructor(private http: HttpClient) {}

  getAllRaces(): Observable<Race[]> {
    return this.http.get<Race[]>(this.apiUrl);
  }

  getRaceById(id: number): Observable<Race>{
    return this.http.get<Race>('${this.apiUrl}/${id}');
  }

  createRace(data: CreateRaceDTO ): Observable<Race>{
    return this.http.post<Race>('${this.apiUrl}/create', data);
  }
}
