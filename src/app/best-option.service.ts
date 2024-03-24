import { Injectable } from '@angular/core';
import { Option } from './datasource';
import { BestOption } from './types';

@Injectable({ providedIn: 'root' })
export class BestOptionService {
  findBestOptions(
    data: Option[],
    numOptions: number = 1,
    exactMatch: boolean,
    needed_area_m2?: number,
    needed_energy?: number
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
      if (
        ((!needed_area_m2 || obj.area_m2 <= needed_area_m2) && (!needed_energy || obj.energy <= needed_energy)) ||
        !exactMatch
      ) {
        // Calculate the number of times this option should be used
        let quantity = 0;

        if (exactMatch) {
          /** If exact match is required, calculate the quantity based on the floor of the minimum value
           * obtained by dividing the remaining area_m2 and energy by the respective area_m2 and energy of the option.
           * This ensures that the quantity does not exceed the available area_m2 and energy.
           **/
          quantity = Math.min(
            needed_area_m2 ? Math.floor(needed_area_m2 / obj.area_m2) : Infinity, // If needed_area_m2 is provided, calculate quantity based on dimension
            needed_energy ? Math.floor(needed_energy / obj.energy) : Infinity // If needed_energy is provided, calculate quantity based on energy
          );
        } else {
          /** If exact match is NOT required, calculate the quantity based on the ceiling of the maximum value
           * obtained by dividing the remaining area_m2 and energy by the respective area_m2 and energy of the option.
           * This allows for selecting options that exceed the required area_m2 and energy while minimizing the difference.
           **/
          quantity = Math.ceil(
            Math.max(
              needed_area_m2 ? needed_area_m2 / obj.area_m2 : 0, // If needed_area_m2 is provided, calculate quantity based on area_m2
              needed_energy ? needed_energy / obj.energy : 0 // If needed_energy is provided, calculate quantity based on energy
            )
          );
        }

        // Calculate difference area and energy after using this option
        const difference_area = (needed_area_m2 ?? 0) - obj.area_m2 * quantity;
        const difference_energy = (needed_energy ?? 0) - obj.energy * quantity;

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
