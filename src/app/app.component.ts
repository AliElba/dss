import { AfterViewInit, Component, HostListener, inject, ViewChild } from '@angular/core';
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
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatInputModule, MatButtonModule, MatTableModule, MatSortModule, FormsModule, MatCheckbox],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('changeHeight', [
      state('original', style({ height: '100vh' })),
      state('small', style({ height: '200px' })),
      transition('original => small', [animate('350ms ease-in-out')]),
    ]),
    trigger('buttonLeave', [transition(':leave', [animate('350ms ease-out', style({ opacity: 0 }))])]),
  ],
})
export class AppComponent implements AfterViewInit {
  bestOptionService = inject(BestOptionService);

  currentHeaderState = 'original';

  @ViewChild(MatSort, { static: true }) matSort!: MatSort;
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
    'totalArea',
    'totalEnergy',
    'difference_area',
    'difference_energy',
  ];
  needed_area_m2?: number;
  needed_energy?: number;
  numOfAlternatives = 3;
  allBestOptions = new Array<BestOption>();

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition =
      window.scrollY || (document.documentElement || document.body.parentNode || document.body).scrollTop || 0;

    if (scrollPosition > 0 && this.currentHeaderState === 'original') {
      this.currentHeaderState = 'small';
    }
  }

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
    this.allBestOptions = this.bestOptionService.findBestOptions([...DATA_SOURCE], this.needed_area_m2, this.needed_energy);
    this.dataSource.data = this.allBestOptions.slice(0, this.numOfAlternatives);

    this.sortAllBestOptionsAndSetDatasourceWithNumOfAlternatives('weight');

    // apply default sorting on the mat-table with only numOfAlternatives datasource
    if (this.dataSource.data.length > 0 && !this.dataSource.sort?.active) {
      this.dataSource.sort?.sort({ id: 'weight', start: 'asc', disableClear: true });
    }

    this.currentHeaderState = 'small';
  }

  clearSort() {
    this.matSort.sort({ id: '', start: 'asc', disableClear: false });
  }

  sortAllBestOptionsAndSetDatasourceWithNumOfAlternatives(priority: Priority = 'energy') {
    this.clearSort();

    const sortedAllBestOptions = this.allBestOptions.sort((a, b) => {
      if (priority === 'weight') {
        // First, sort by less weight (ascending order)
        if (a.option.weight !== b.option.weight) {
          return a.option.weight - b.option.weight;
        }

        if (!a.difference_energy || !b.difference_energy) {
          return 0;
        }

        // If weight differences are equal, sort by highest energy (ascending order)
        return b.difference_energy - a.difference_energy;
      } else {
        // First, sort by highest energy (ascending order)
        if (!!a.difference_energy && !!b.difference_energy && a.difference_energy !== b.difference_energy) {
          return b.difference_energy - a.difference_energy;
        }

        // If energy differences are equal, sort by less weight (ascending order)
        return a.option.weight - b.option.weight;
      }
    });

    this.dataSource.data = sortedAllBestOptions.slice(0, this.numOfAlternatives);
  }
}
