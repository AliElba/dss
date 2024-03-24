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

  it('should find best options when only needed_energy is provided', () => {
    const bestOptions = service.findBestOptions(DATA_SOURCE, 1, true, undefined, 1100);
    expect(bestOptions.length).toBe(1);
    expect(bestOptions[0].option.id_sub).toBe('A1.1');
    expect(bestOptions[0].difference_area).toBe(-6);
    expect(bestOptions[0].difference_energy).toBe(17);
  });

  it('should find best options when only needed_area_m2 is provided', () => {
    const bestOptions = service.findBestOptions(DATA_SOURCE, 1, true, 6);
    expect(bestOptions.length).toBe(1);
    expect(bestOptions[0].option.id_sub).toBe('A1.1');
    expect(bestOptions[0].difference_area).toBe(0);
    expect(bestOptions[0].difference_energy).toBe(-1083);
  });

  it('should find best options when both needed_energy and needed_area_m2 are provided', () => {
    const bestOptions = service.findBestOptions(DATA_SOURCE, 2, true, 6, 1100);
    expect(bestOptions.length).toBe(1);
    expect(bestOptions[0].option.id_sub).toBe('A1.1');
    expect(bestOptions[0].difference_area).toBe(0);
    expect(bestOptions[0].difference_energy).toBe(17);
  });
});
