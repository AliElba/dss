import { Injectable } from '@angular/core';
import { Option } from './datasource';
import { BestOption } from './types';

@Injectable({ providedIn: 'root' })
export class BestOptionService {
  findBestOptions(data: Option[], needed_area_m2?: number, needed_energy?: number): BestOption[] {
    const bestOptions: BestOption[] = [];

    // Sort data based on the system
    data.sort((a, b) => a.system.localeCompare(b.system));

    // Iterate through the data
    for (const obj of data) {
      // Calculate the number of times this option should be used
      const quantity = Math.min(
        needed_area_m2 ? Math.floor(needed_area_m2 / obj.area_m2) : Infinity, // Exact or less than required
        needed_energy ? Math.ceil(needed_energy / obj.energy) : Infinity // Exact or more than required
      );

      if (quantity <= 0) continue; // violation to Quantity Rule, skip this option

      // violation to Energy Rule, skip this option: produced energy should not be less than needed energy
      if (!!needed_energy && quantity * needed_energy < obj.energy) continue;

      // Calculate difference area and energy after using this option * qty
      const difference_area = needed_area_m2 ? obj.area_m2 * quantity - needed_area_m2 : undefined;
      const difference_energy = needed_energy ? obj.energy * quantity - needed_energy : undefined;

      // violation to Energy Rule, skip this option: after match area,
      // produced energy should not be less than needed energy
      if (!!difference_energy && difference_energy < 0) continue;

      // Add the option to the bestOptions array with the calculated quantity and remaining area and energy
      bestOptions.push({
        option: obj,
        quantity: quantity,
        totalArea: quantity * obj.area_m2,
        totalEnergy: quantity * obj.energy,
        difference_area: difference_area,
        difference_energy: difference_energy,
      });
    }

    return bestOptions;
  }
}
