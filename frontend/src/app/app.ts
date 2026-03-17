import { Component, ViewChild } from '@angular/core';
import { ListComponent } from './components/race/list/list';
import { FormComponent } from './components/race/form/form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ListComponent, FormComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  @ViewChild(ListComponent) listComponent!: ListComponent;

  title = 'SuiviAkoho';

  onRaceCreated(): void {
    // Refresh the list after a new race is created
    if (this.listComponent) {
      this.listComponent.loadRaces();
    }
  }
}
