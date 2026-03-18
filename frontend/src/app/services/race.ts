import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateRaceDTO, Race } from '../models/race.model';

@Injectable({
  providedIn: 'root',
})
export class RaceService {
  private apiUrl = 'http://localhost:3000/api/races';

  constructor(private http: HttpClient) {}

  getAllRaces(): Observable<Race[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(races => races.map(race => ({
        ...race,
        createdAt: new Date(race.createdAt),
        descriptionJson: this.parseDescription(race.descriptionJson)
      })))
    );
  }

  getRaceById(id: number): Observable<Race>{
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(race => ({
        ...race,
        createdAt: new Date(race.createdAt),
        descriptionJson: this.parseDescription(race.descriptionJson)
      }))
    );
  }

  private parseDescription(description: any): Record<string, any> | null {
    if (!description) return null;

    // If it's already an object, return it
    if (typeof description === 'object') {
      return description;
    }

    // If it's a string, try to parse it as JSON
    if (typeof description === 'string') {
      try {
        return JSON.parse(description);
      } catch (e) {
        console.warn('Failed to parse description:', description);
        return null;
      }
    }

    return null;
  }

  createRace(data: CreateRaceDTO ): Observable<Race>{
    return this.http.post<Race>(`${this.apiUrl}/create`, data);
  }
}
