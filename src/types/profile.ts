import { EquipmentId } from './training';

export type WeightUnit = 'kg' | 'lb';
export type HeightUnit = 'cm' | 'ft';

export interface UserProfile {
  birthday: string | null;
  age: number | null;
  heightCm: number | null;
  weight: number | null;
  weightUnit: WeightUnit;
  heightUnit?: HeightUnit;
  selectedEquipment: EquipmentId[];
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  birthday: null,
  age: null,
  heightCm: null,
  weight: null,
  weightUnit: 'kg',
  heightUnit: 'cm',
  selectedEquipment: [],
};
