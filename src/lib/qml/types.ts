export interface DataPoint {
  x: [number, number];
  label: 0 | 1;
}

export type Dataset = DataPoint[];

export interface VQCParams {
  layers: number;
  weights: number[];
}

export interface TrainingState {
  epoch: number;
  loss: number;
  accuracy: number;
  weights: number[];
  lossHistory: number[];
}
