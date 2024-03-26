import { Option } from './datasource';

export type BestOption = {
  option: Option;
  difference_area?: number;
  difference_energy?: number;
  quantity: number;
};

export type Priority = 'area' | 'energy' | 'weight';
