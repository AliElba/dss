import { TestBed } from '@angular/core/testing';
import { BestOptionService } from './best-option.service';
import { DATA_SOURCE } from './datasource';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('BestOptionService', () => {
  let service: BestOptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [BestOptionService],
    });
    service = TestBed.inject(BestOptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Filter by AREA', () => {
    it('should find best options with EXACT or LESS', () => {
      const needed_area_m2 = [12, 11, 20, 30, 40, 5, 18, 100, 40];
      const needed_energy = undefined;

      needed_area_m2.forEach((_needed_area_m2) => {
        const bestOptions = service.findBestOptions(DATA_SOURCE, 30, _needed_area_m2, needed_energy);
        bestOptions.forEach((x) => expect(x.difference_area).toBeLessThanOrEqual(0));
      });
    });

    it('should NOT find any options with more than required area', () => {
      const needed_area_m2 = [12, 11, 20, 30, 40, 5, 18, 100, 40];
      const needed_energy = undefined;

      needed_area_m2.forEach((_needed_area_m2) => {
        const bestOptions = service.findBestOptions(DATA_SOURCE, 30, _needed_area_m2, needed_energy);
        expect(bestOptions.some((x) => x.difference_area! > 0)).toBeFalsy();
      });
    });
  });

  describe('Filter by ENERGY: ', () => {
    it('should find best options with EXACT or MORE than required, when needed_energy provided', () => {
      const needed_area_m2 = undefined;
      const needed_energy = [5000, 1100, 2000, 4000, 1400, 1500, 1083, 1443];

      needed_energy.forEach((_needed_energy) => {
        const bestOptions = service.findBestOptions(DATA_SOURCE, 30, needed_area_m2, _needed_energy);
        expect(bestOptions.every((x) => x.difference_energy! >= 0)).toBeTrue();
      });
    });

    it('should NOT find any options with less than required, when needed_energy provided', () => {
      const needed_area_m2 = undefined;
      const needed_energy = [5000, 1100, 2000, 4000, 1400, 1500, 1083, 1443];

      needed_energy.forEach((_needed_energy) => {
        const bestOptions = service.findBestOptions(DATA_SOURCE, 30, needed_area_m2, _needed_energy);
        bestOptions.forEach((x) => expect(x.difference_energy).not.toBeLessThan(0));
      });
    });
  });

  describe('Filter by Both Energy and Area on same time: ', () => {
    it('should find best options with exact or more ENERGY and exact or lessAREA', () => {
      const needed_area_m2 = [12, 11, 20, 30, 40, 5, 18, 100, 40];
      const needed_energy = [5000, 1100, 2000, 4000, 1400, 1500, 1083, 1443];

      needed_area_m2.forEach((_needed_area_m2) => {
        needed_energy.forEach((_needed_energy) => {
          const bestOptions = service.findBestOptions(DATA_SOURCE, 30, _needed_area_m2, _needed_energy);
          bestOptions.forEach((opt) => {
            expect(opt.difference_energy)
              .withContext(`area: ${_needed_area_m2}, energy: ${_needed_energy} (difference_energy)`)
              .toBeGreaterThanOrEqual(0);

            expect(opt.difference_area)
              .withContext(`area: ${_needed_area_m2}, energy: ${_needed_energy} (difference_area)`)
              .toBeLessThanOrEqual(0);
          });
        });
      });
    });
  });
});
