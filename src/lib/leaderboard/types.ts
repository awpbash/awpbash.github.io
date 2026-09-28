export type DatasetId = "language" | "image" | "voice" | "video";
export type MetricKey = string;
export type WeightsFilter = "all" | "open" | "closed";

export interface ModelRecord {
  id: string;
  name: string;
  fullName: string;
  creator: { slug: string; name: string };
  openWeights: boolean;
  reasoning?: boolean;
  estimated?: boolean;
  sizeValue?: number | null;
  values: Record<MetricKey, number | null>;
}

export interface LeaderboardDataset {
  id: DatasetId;
  label: string;
  description: string;
  source: string;
  modelCount: number;
  models: ModelRecord[];
}

export interface LeaderboardData {
  generatedAt: string;
  datasets: LeaderboardDataset[];
}

export interface AxisSelection {
  x: MetricKey;
  y: MetricKey;
  z: MetricKey | null;
}

export interface FilterState {
  datasetId: DatasetId;
  presetId: string;
  axes: AxisSelection;
  creators: string[];
  search: string;
  axisRange: [number, number] | null;
  minContext: number;
  weights: WeightsFilter;
}
