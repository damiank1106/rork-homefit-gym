import { EquipmentId } from './training';

export type WeightUnit = 'kg' | 'lb';

export interface UserProfile {
  age: number | null;
  heightCm: number | null;
  weight: number | null;
  weightUnit: WeightUnit;
  selectedEquipment: EquipmentId[];
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  age: null,
  heightCm: null,
  weight: null,
  weightUnit: 'kg',
  selectedEquipment: [],
};
