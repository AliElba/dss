import { Injectable } from '@angular/core';
import { Option } from './datasource';
import { BestOption } from './types';

@Injectable({ providedIn: 'root' })
export class BestOptionService {
  findBestOptions(data: Option[], numOptions: number = 1, needed_area_m2?: number, needed_energy?: number): BestOption[] {
    const bestOptions: BestOption[] = [];
    let remainingOptions = numOptions;

    // Sort data based on the system
    data.sort((a, b) => a.system.localeCompare(b.system));

    // Iterate through the data
    for (const obj of data) {
      // Check if there are remaining options needed
      if (remainingOptions <= 0) break;

      // Check if the option meets the area and energy requirements
      if ((!!needed_area_m2 && obj.area_m2 <= needed_area_m2) || (!!needed_energy && obj.energy >= needed_energy)) {
        // Calculate the number of times this option should be used
        const quantity = Math.min(
          needed_area_m2 ? Math.floor(needed_area_m2 / obj.area_m2) : Infinity, // Exact or less than required
          needed_energy ? Math.ceil(needed_energy / obj.energy) : Infinity // Exact or more than required
        );

        if (quantity <= 0) continue; // violation to Quantity Rule, skip this option

        // Calculate difference area and energy after using this option * qty
        const difference_area = needed_area_m2 ? obj.area_m2 * quantity - needed_area_m2 : undefined;
        const difference_energy = needed_energy ? obj.energy * quantity - needed_energy : undefined;

        if (!!difference_energy && difference_energy < 0) continue; // violation to Energy Rule, skip this option

        // Add the option to the bestOptions array with the calculated quantity and remaining area and energy
        bestOptions.push({
          option: obj,
          quantity: quantity,
          difference_area: difference_area,
          difference_energy: difference_energy,
        });

        // Update the remainingOptions count
        remainingOptions--;
      }
    }

    return bestOptions;
  }
}
