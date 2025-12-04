import { Equipment } from '@/src/types/training';

export const EQUIPMENT: Equipment[] = [
  {
    id: 'bodyweight',
    label: 'Bodyweight',
    description: 'No equipment needed - just your body!',
    icon: 'bodyweight',
  },
  {
    id: 'mat',
    label: 'Yoga Mat',
    description: 'A soft surface for floor exercises',
    icon: 'mat',
  },
  {
    id: 'dumbbells',
    label: 'Dumbbells',
    description: 'Free weights for strength training',
    icon: 'dumbbells',
  },
  {
    id: 'mini_band',
    label: 'Mini Band',
    description: 'Small resistance loop for lower body',
    icon: 'mini_band',
  },
  {
    id: 'long_band',
    label: 'Long Band',
    description: 'Full-length resistance band',
    icon: 'long_band',
  },
  {
    id: 'kettlebell',
    label: 'Kettlebell',
    description: 'Cast iron weight for dynamic movements',
    icon: 'kettlebell',
  },
  {
    id: 'chair_step',
    label: 'Chair/Step',
    description: 'Elevated surface for step exercises',
    icon: 'chair_step',
  },
  {
    id: 'jump_rope',
    label: 'Jump Rope',
    description: 'Classic cardio equipment',
    icon: 'jump_rope',
  },
  {
    id: 'stability_ball',
    label: 'Stability Ball',
    description: 'Large exercise ball for core work',
    icon: 'stability_ball',
  },
  {
    id: 'foam_roller',
    label: 'Foam Roller',
    description: 'Self-massage and recovery tool',
    icon: 'foam_roller',
  },
];

export const getEquipmentById = (id: string): Equipment | undefined => {
  return EQUIPMENT.find((e) => e.id === id);
};
