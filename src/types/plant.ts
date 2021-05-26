export interface Plant {
  id: string;
  name: string;
  waterInterval?: number;
  lastWatered?: number;
  createdAt?: number;
  updatedAt?: number;
}