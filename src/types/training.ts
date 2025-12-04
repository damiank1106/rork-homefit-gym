export type BodyArea = 
  | 'full_body' 
  | 'legs_glutes' 
  | 'core' 
  | 'upper_body' 
  | 'cardio' 
  | 'stretch';

export type EquipmentId = 
  | 'bodyweight' 
  | 'mat' 
  | 'dumbbells' 
  | 'mini_band' 
  | 'long_band' 
  | 'kettlebell' 
  | 'chair_step' 
  | 'jump_rope' 
  | 'stability_ball' 
  | 'foam_roller';

export type IntensityLevel = 1 | 2 | 3;

export interface Equipment {
  id: EquipmentId;
  label: string;
  description: string;
  icon: string;
}

export interface ExerciseMedia {
  image: string;
  video: string;
  sounds: {
    start: string;
    halfway: string;
    end: string;
  };
}

export interface Exercise {
  id: string;
  name: string;
  bodyArea: BodyArea;
  equipment: EquipmentId[];
  intensity: IntensityLevel;
  defaultDurationSec: number;
  met: number;
  description: string;
  coachingCues: string[];
  media: ExerciseMedia;
}

export const BODY_AREA_LABELS: Record<BodyArea, string> = {
  full_body: 'Full Body',
  legs_glutes: 'Legs & Glutes',
  core: 'Core',
  upper_body: 'Upper Body',
  cardio: 'Cardio',
  stretch: 'Stretch',
};

export const INTENSITY_LABELS: Record<IntensityLevel, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};
