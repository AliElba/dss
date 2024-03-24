import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DATA_SOURCE, Option } from './datasource';
import { MatCheckbox } from '@angular/material/checkbox';
import { BestOption, Priority } from './types';
import { BestOptionService } from './best-option.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatInputModule, MatButtonModule, MatTableModule, FormsModule, MatCheckbox],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  bestOptionService = inject(BestOptionService);
  displayedColumns: Array<keyof Option | keyof BestOption> = [
    'system',
    'id_main',
    'id_sub',
    'span',
    'dimension_x',
    'dimension_y',
    'area_m2',
    'weight',
    'no_solar_panel',
    'energy',
    'quantity',
    'difference_area',
    'difference_energy',
  ];
  bestOptions = signal<BestOption[]>([]);
  exactMatch = signal<boolean>(true);
  needed_area_m2?: number;
  needed_energy?: number = 2000;
  numOptions = 5;

  onFindBestOptions() {
    this.bestOptions.set(
      this.bestOptionService.findBestOptions(
        DATA_SOURCE,
        this.numOptions,
        this.exactMatch(),
        this.needed_area_m2,
        this.needed_energy
      )
    );
  }

  sortBestOptions(priority: Priority) {
    this.bestOptions.update((x) => {
      return [...x].sort((a, b) => {
        if (priority === 'energy') {
          /**
           * To convert an array containing both positive and negative numbers to an array where all values are positive,
           * use the Math.abs() which returns the absolute value of a number,
           * which is the number's positive magnitude.
           */
          return Math.abs(a.difference_energy) - Math.abs(b.difference_energy);
        }

        if (priority === 'area') {
          return Math.abs(a.difference_area) - Math.abs(b.difference_area);
        }

        // Default sorting behavior if the priority is not recognized
        return 0;
      });
    });
  }
}
