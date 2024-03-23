import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DATA_SOURCE, Option } from '../datasource';
import { MatCheckbox } from '@angular/material/checkbox';

interface BestOption {
  option: Option;
  difference_dimension: number;
  difference_energy: number;
  quantity: number;
}

type Priority = 'dimension' | 'energy';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatInputModule, MatButtonModule, MatTableModule, FormsModule, MatCheckbox],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  bestOptions = signal<BestOption[]>([]);
  exactMatch = signal<boolean>(true);
  dimension_m2_needed?: number;
  energy_needed?: number;
  numOptions = 5;

  onFindBestOptions() {
    this.bestOptions.set(
      this.findBestOptions(DATA_SOURCE, this.numOptions, this.exactMatch(), this.dimension_m2_needed, this.energy_needed)
    );
  }

  findBestOptions(
    data: Option[],
    numOptions: number = 1,
    exactMatch: boolean,
    dimension_m2?: number,
    energy?: number
  ): BestOption[] {
    const bestOptions: BestOption[] = [];
    let remainingOptions = numOptions;

    // Sort data based on the system
    data.sort((a, b) => a.system.localeCompare(b.system));

    // Iterate through the data
    for (const obj of data) {
      // Check if there are remaining options needed
      if (remainingOptions <= 0) break;

      // Check if the option system matches the required system, or exact match not required
      if (((!dimension_m2 || obj.dimension_m2 <= dimension_m2) && (!energy || obj.energy <= energy)) || !exactMatch) {
        // Calculate the number of times this option should be used
        let quantity = 0;

        if (exactMatch) {
          /** If exact match is required, calculate the quantity based on the floor of the minimum value
           * obtained by dividing the remaining dimension and energy by the respective dimension and energy of the option.
           * This ensures that the quantity does not exceed the available dimension and energy.
           **/
          //quantity = Math.min(Math.floor(dimension_m2 / obj.dimension_m2), Math.floor(energy / obj.energy));

          quantity = Math.min(
            dimension_m2 ? Math.floor(dimension_m2 / obj.dimension_m2) : Infinity, // If dimension_m2 is provided, calculate quantity based on dimension
            energy ? Math.floor(energy / obj.energy) : Infinity // If energy is provided, calculate quantity based on energy
          );
        } else {
          /** If exact match is NOT required, calculate the quantity based on the ceiling of the maximum value
           * obtained by dividing the remaining dimension and energy by the respective dimension and energy of the option.
           * This allows for selecting options that exceed the required dimension and energy while minimizing the difference.
           **/
          //quantity = Math.ceil(Math.max(dimension_m2 / obj.dimension_m2, energy / obj.energy));

          quantity = Math.ceil(
            Math.max(
              dimension_m2 ? dimension_m2 / obj.dimension_m2 : 0, // If dimension_m2 is provided, calculate quantity based on dimension
              energy ? energy / obj.energy : 0 // If energy is provided, calculate quantity based on energy
            )
          );
        }

        // Calculate remaining dimension and energy after using this option
        const remaining_dimension = (dimension_m2 ?? 0) - obj.dimension_m2 * quantity;
        const remaining_energy = (energy ?? 0) - obj.energy * quantity;

        // Add the option to the bestOptions array with the calculated quantity and remaining dimension and energy
        bestOptions.push({
          option: obj,
          quantity: quantity,
          difference_dimension: remaining_dimension,
          difference_energy: remaining_energy,
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
          /**
           * To convert an array containing both positive and negative numbers to an array where all values are positive,
           * use the Math.abs() which returns the absolute value of a number,
           * which is the number's positive magnitude.
           */
          return Math.abs(a.difference_energy) - Math.abs(b.difference_energy);
        }

        if (priority === 'dimension') {
          return Math.abs(a.difference_dimension) - Math.abs(b.difference_dimension);
        }

        // Default sorting behavior if the priority is not recognized
        return 0;
      });
    });
  }
}
