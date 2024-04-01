import { Option } from './datasource';

export type BestOption = {
  option: Option;
  quantity: number;
  totalArea: number;
  totalEnergy: number;
  difference_area?: number;
  difference_energy?: number;
};

export type Priority = 'area' | 'energy' | 'weight';
