import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

interface Option {
  system: string;
  id_main: string;
  id_sub: string;
  dimension_x: number;
  dimension_y: number;
  dimension_m2: number;
  no_solar_panel: number;
  energy: number;
}

interface BestOption {
  option: Option;
  difference_dimension: number;
  difference_energy: number;
  quantity: number;
}

type Priority = 'dimension' | 'energy';

const inputArray: Option[] = [
  {
    system: 'System A one column',
    id_main: 'A1',
    id_sub: 'A1.1',
    dimension_x: 2,
    dimension_y: 3,
    dimension_m2: 6,
    no_solar_panel: 5,
    energy: 500,
  },
  {
    system: 'System A one column',
    id_main: 'A1',
    id_sub: 'A1.2',
    dimension_x: 3,
    dimension_y: 4,
    dimension_m2: 12,
    no_solar_panel: 5,
    energy: 600,
  },
  {
    system: 'System B one column',
    id_main: 'B1',
    id_sub: 'B1.1',
    dimension_x: 4,
    dimension_y: 5,
    dimension_m2: 20,
    no_solar_panel: 7,
    energy: 700,
  },
  {
    system: 'System B one column',
    id_main: 'B1',
    id_sub: 'B1.2',
    dimension_x: 5,
    dimension_y: 6,
    dimension_m2: 30,
    no_solar_panel: 8,
    energy: 800,
  },
  {
    system: 'System C two column',
    id_main: 'C1',
    id_sub: 'C1.1',
    dimension_x: 6,
    dimension_y: 7,
    dimension_m2: 42,
    no_solar_panel: 10,
    energy: 900,
  },
  {
    system: 'System C two column',
    id_main: 'C1',
    id_sub: 'C1.2',
    dimension_x: 7,
    dimension_y: 8,
    dimension_m2: 56,
    no_solar_panel: 12,
    energy: 1000,
  },
  {
    system: 'System D two column',
    id_main: 'D1',
    id_sub: 'D1.1',
    dimension_x: 8,
    dimension_y: 9,
    dimension_m2: 72,
    no_solar_panel: 15,
    energy: 1100,
  },
  {
    system: 'System D two column',
    id_main: 'D1',
    id_sub: 'D1.2',
    dimension_x: 9,
    dimension_y: 10,
    dimension_m2: 90,
    no_solar_panel: 18,
    energy: 1200,
  },
  {
    system: 'System E three column',
    id_main: 'E1',
    id_sub: 'E1.1',
    dimension_x: 10,
    dimension_y: 11,
    dimension_m2: 110,
    no_solar_panel: 20,
    energy: 1300,
  },
  {
    system: 'System E three column',
    id_main: 'E1',
    id_sub: 'E1.2',
    dimension_x: 11,
    dimension_y: 12,
    dimension_m2: 132,
    no_solar_panel: 22,
    energy: 1400,
  },
  {
    system: 'System F three column',
    id_main: 'F1',
    id_sub: 'F1.1',
    dimension_x: 12,
    dimension_y: 13,
    dimension_m2: 156,
    no_solar_panel: 25,
    energy: 1500,
  },
  {
    system: 'System F three column',
    id_main: 'F1',
    id_sub: 'F1.2',
    dimension_x: 13,
    dimension_y: 14,
    dimension_m2: 182,
    no_solar_panel: 28,
    energy: 1600,
  },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatInputModule, MatButtonModule, MatTableModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  bestOptions = signal<BestOption[]>([]);
  dimension_m2_needed = 40;
  energy_needed = 2000;
  numOptions = 5;

  constructor() {
    // Example usage
    const dimension_m2_needed: number = 500;
    const energy_needed: number = 2000;
    const numOptions: number = 5; // Number of options you want to retrieve

    const bestOptions: BestOption[] = this.findBestOptions(inputArray, dimension_m2_needed, energy_needed, numOptions);

    console.log(`Best ${numOptions} options for (dimension: ${dimension_m2_needed} energy: ${energy_needed}):`);
    if (bestOptions.length === 0) {
      console.log('No options found.');
    } else {
      bestOptions.forEach((option, index) => {
        console.log(`Option ${index + 1}:`);
        console.log(option.option);
        console.log(`Quantity: ${option.quantity}`);
        console.log(`Remaining difference in dimensions: ${option.difference_dimension} from ${option.option.dimension_m2}`);
        console.log(`Remaining difference in energy: ${option.difference_energy} from ${option.option.energy}`);
      });
    }
  }

  onFindBestOptions() {
    this.bestOptions.set(this.findBestOptions(inputArray, this.dimension_m2_needed, this.energy_needed, this.numOptions));
  }

  findBestOptions(data: Option[], dimension_m2: number, energy: number, numOptions: number): BestOption[] {
    const bestOptions: BestOption[] = [];
    let remainingOptions = numOptions;

    // Sort data based on the system
    data.sort((a, b) => a.system.localeCompare(b.system));

    // Iterate through the data
    for (const obj of data) {
      // Check if there are remaining options needed
      if (remainingOptions <= 0) break;

      // Check if the option system matches the required system
      if (obj.dimension_m2 <= dimension_m2 && obj.energy <= energy) {
        // Calculate the number of times this option should be used
        const quantity = Math.min(Math.floor(dimension_m2 / obj.dimension_m2), Math.floor(energy / obj.energy));

        // Add the option to the bestOptions array with the calculated quantity
        bestOptions.push({
          option: obj,
          quantity: quantity,
          difference_dimension: dimension_m2 - obj.dimension_m2 * quantity,
          difference_energy: energy - obj.energy * quantity,
        });

        // Update the remainingOptions count
        remainingOptions--;
      }
    }

    return bestOptions;
  }

  sortBestOptions(priority: Priority) {
    this.bestOptions.update((x) => {
      return [...x].sort((a, b) => {
        if (priority === 'energy') {
          return a.difference_energy - b.difference_energy;
        }

        if (priority === 'dimension') {
          return a.difference_dimension - b.difference_dimension;
        }

        // Default sorting behavior if the priority is not recognized
        return 0;
      });
    });
  }
}
