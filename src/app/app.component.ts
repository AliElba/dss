import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DATA_SOURCE, Option } from './datasource';
import { MatCheckbox } from '@angular/material/checkbox';
import { BestOption, Priority } from './types';
import { BestOptionService } from './best-option.service';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatInputModule, MatButtonModule, MatTableModule, MatSortModule, FormsModule, MatCheckbox],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  bestOptionService = inject(BestOptionService);

  @ViewChild(MatSort) matSort!: MatSort;
  dataSource = new MatTableDataSource(new Array<BestOption>());

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
  exactMatch = signal<boolean>(true);
  needed_area_m2?: number;
  needed_energy?: number = 5000;
  numOfAlternatives = 10;

  ngAfterViewInit() {
    this.dataSource.sort = this.matSort;

    this.dataSource.sortingDataAccessor = (item, property: string) => {
      switch (property) {
        case 'weight':
          return item.option.weight;
        case 'energy':
          return item.option.energy;
        case 'no_solar_panel':
          return item.option.no_solar_panel;
        case 'area_m2':
          return item.option.area_m2;
        // Add cases for other nested properties if needed
        default:
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          return item[property];
      }
    };
  }

  onFindBestOptions() {
    this.dataSource.data = this.bestOptionService.findBestOptions(
      [...DATA_SOURCE],
      this.numOfAlternatives,
      this.exactMatch(),
      this.needed_area_m2,
      this.needed_energy
    );

    if (this.dataSource.data.length > 0 && !this.dataSource.sort?.active) {
      this.dataSource.sort?.sort({ id: 'weight', start: 'asc', disableClear: true });
    }
  }

  sortBestOptions(priority: Priority) {
    this.dataSource.data = [...this.dataSource.data].sort((a, b) => {
      if (priority === 'energy') {
        /**
         * Convert an array containing both positive and negative numbers to an array
         * where all values are positive,
         * use the Math.abs() which returns the absolute value of a number,
         */
        return Math.abs(a.difference_energy) - Math.abs(b.difference_energy);
      }

      if (priority === 'area') {
        return Math.abs(a.difference_area) - Math.abs(b.difference_area);
      }

      // Default sorting behavior if the priority is not recognized
      return 0;
    });
  }
}
