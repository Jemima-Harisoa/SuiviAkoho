import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Race } from '../../../models/race.model';
import { RaceService } from '../../../services/race';
import { CommonModule } from '@angular/common';
import { finalize, timeout } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})

export class ListComponent implements OnInit {
  races: Race[] = [];
  loading = false;
  error: string | null = null;

  constructor(private raceService: RaceService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadRaces();
  }

  loadRaces(): void {
    this.loading = true;
    this.error = null;

    const request$ = this.raceService.getAllRaces();

    request$.pipe(
      timeout(10000),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (data) => {
        this.races = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (err?.name === 'TimeoutError') {
          this.error = 'Timeout: Le serveur met trop de temps a repondre (10s).';
          return;
        }

        if (err instanceof HttpErrorResponse) {
          this.error = `Erreur HTTP ${err.status}: ${err.message}. URL: ${err.url ?? 'N/A'}`;
          return;
        }

        this.error = 'Erreur reseau: ' + err.message;
      }

    });

  }
}

