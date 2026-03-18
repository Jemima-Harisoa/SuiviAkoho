import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RaceService } from '../../../services/race';
import { CreateRaceDTO } from '../../../models/race.model';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class FormComponent implements OnInit {
  @Output() raceCreated = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;

  constructor(
    private fb: FormBuilder,
    private raceService: RaceService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      properties: this.fb.array([])
    });
  }

  get properties(): FormArray {
    return this.form.get('properties') as FormArray;
  }

  addProperty(): void {
    const property = this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    });
    this.properties.push(property);
  }

  removeProperty(index: number): void {
    this.properties.removeAt(index);
  }

  onSubmit(): void {
    if (!this.form.valid || this.form.get('name')?.invalid) {
      this.message = 'Formulaire invalide. Veuillez vérifier les champs.';
      this.messageType = 'error';
      return;
    }

    this.loading = true;
    this.message = null;
    this.messageType = null;

    const name = this.form.get('name')?.value?.trim();

    // Build descriptionJson from properties
    const descriptionJson: Record<string, any> = {};
    this.properties.value.forEach((prop: { key: string; value: any }) => {
      if (prop.key && prop.value) {
        // Try to parse value as number if possible, else keep as string
        const parsedValue = isNaN(Number(prop.value)) ? prop.value : Number(prop.value);
        descriptionJson[prop.key] = parsedValue;
      }
    });

    const payload: CreateRaceDTO = {
      name,
      descriptionJson
    };

    this.raceService.createRace(payload).subscribe({
      next: () => {
        this.message = `Race "${name}" créée avec succès!`;
        this.messageType = 'success';
        this.resetForm();
        this.raceCreated.emit();
      },
      error: (err) => {
        this.message = `Erreur: ${err?.message || 'Impossible de créer la race'}`;
        this.messageType = 'error';
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.form.reset();
    this.properties.clear();
    this.message = null;
    this.messageType = null;
    this.loading = false;
  }
}
