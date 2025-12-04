import { Exercise } from '@/src/types/training';

const PLACEHOLDER_IMAGES: Record<string, string> = {
  jumping_jacks: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
  burpees: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&h=400&fit=crop',
  bodyweight_squat: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=400&fit=crop',
  glute_bridge: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop',
  dumbbell_goblet_squat: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=400&fit=crop',
  plank: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=400&fit=crop',
  bicycle_crunches: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
  incline_pushup: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=400&fit=crop',
  dumbbell_row: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=400&fit=crop',
  high_knees: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=400&fit=crop',
  childs_pose: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
};

export const EXERCISES: Exercise[] = [
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    bodyArea: 'full_body',
    equipment: ['bodyweight'],
    intensity: 2,
    defaultDurationSec: 45,
    met: 8.0,
    description: 'A classic full-body cardio move that elevates your heart rate and warms up your entire body.',
    coachingCues: [
      'Start standing with arms at sides',
      'Jump feet out while raising arms overhead',
      'Land softly with knees slightly bent',
      'Jump back to start and repeat',
    ],
    media: {
      image: PLACEHOLDER_IMAGES.jumping_jacks,
      video: '',
      sounds: {
        start: '',
        halfway: '',
        end: '',
      },
    },
  },
  {
    id: 'burpees',
    name: 'Burpees',
    bodyArea: 'full_body',
    equipment: ['bodyweight', 'mat'],
    intensity: 3,
    defaultDurationSec: 30,
    met: 10.0,
    description: 'The ultimate full-body exercise combining a squat, push-up, and jump for maximum calorie burn.',
    coachingCues: [
      'Start standing, then squat down',
      'Place hands on floor, jump feet back to plank',
      'Do a push-up (optional)',
      'Jump feet forward, then explode up with arms overhead',
    ],
    media: {
      image: PLACEHOLDER_IMAGES.burpees,
      video: '',
      sounds: {
        start: '',
        halfway: '',
        end: '',
      },
    },
  },
  {
    id: 'bodyweight_squat',
    name: 'Bodyweight Squat',
    bodyArea: 'legs_glutes',
    equipment: ['bodyweight'],
    intensity: 1,
    defaultDurationSec: 45,
    met: 5.0,
    description: 'The foundation of lower body training, targeting quads, hamstrings, and glutes.',
    coachingCues: [
      'Stand with feet shoulder-width apart',
      'Push hips back and bend knees',
      'Lower until thighs are parallel to floor',
      'Drive through heels to stand',
    ],
    media: {
      image: PLACEHOLDER_IMAGES.bodyweight_squat,
      video: '',
      sounds: {
        start: '',
        halfway: '',
        end: '',
      },
    },
  },
  {
    id: 'glute_bridge',
    name: 'Glute Bridge',
    bodyArea: 'legs_glutes',
    equipment: ['mat'],
    intensity: 1,
    defaultDurationSec: 40,
    met: 3.5,
    description: 'Isolate and strengthen your glutes while protecting your lower back.',
    coachingCues: [
      'Lie on back with knees bent, feet flat',
      'Push through heels to lift hips',
      'Squeeze glutes at the top',
      'Lower with control',
    ],
    media: {
      image: PLACEHOLDER_IMAGES.glute_bridge,
      video: '',
      sounds: {
        start: '',
        halfway: '',
        end: '',
      },
    },
  },
  {
    id: 'dumbbell_goblet_squat',
    name: 'Goblet Squat',
    bodyArea: 'legs_glutes',
    equipment: ['dumbbells'],
    intensity: 2,
    defaultDurationSec: 45,
    met: 6.0,
    description: 'A weighted squat variation that improves depth and builds serious lower body strength.',
    coachingCues: [
      'Hold dumbbell at chest with both hands',
      'Keep elbows tucked and chest up',
      'Squat deep, elbows inside knees',
      'Drive up through heels',
    ],
    media: {
      image: PLACEHOLDER_IMAGES.dumbbell_goblet_squat,
      video: '',
      sounds: {
        start: '',
        halfway: '',
        end: '',
      },
    },
  },
  {
    id: 'plank',
    name: 'Plank',
    bodyArea: 'core',
    equipment: ['mat'],
    intensity: 2,
    defaultDurationSec: 45,
    met: 4.0,
    description: 'The ultimate core stabilizer that strengthens your entire midsection and improves posture.',
    coachingCues: [
      'Start on forearms and toes',
      'Keep body in a straight line',
      'Engage core and squeeze glutes',
      'Don\'t let hips sag or pike up',
    ],
    media: {
      image: PLACEHOLDER_IMAGES.plank,
      video: '',
      sounds: {
        start: '',
        halfway: '',
        end: '',
      },
    },
  },
  {
    id: 'bicycle_crunches',
    name: 'Bicycle Crunches',
    bodyArea: 'core',
    equipment: ['mat'],
    intensity: 2,
    defaultDurationSec: 40,
    met: 4.5,
    description: 'Target your obliques and rectus abdominis with this dynamic core movement.',
    coachingCues: [
      'Lie on back, hands behind head',
      'Lift shoulders off ground',
      'Bring opposite elbow to knee',
      'Alternate sides in pedaling motion',
    ],
    media: {
      image: PLACEHOLDER_IMAGES.bicycle_crunches,
      video: '',
      sounds: {
        start: '',
        halfway: '',
        end: '',
      },
    },
  },
  {
    id: 'incline_pushup',
    name: 'Incline Push-up',
    bodyArea: 'upper_body',
    equipment: ['chair_step'],
    intensity: 1,
    defaultDurationSec: 40,
    met: 4.0,
    description: 'A beginner-friendly push-up variation that builds chest and arm strength.',
    coachingCues: [
      'Place hands on elevated surface',
      'Keep body straight from head to heels',
      'Lower chest toward hands',
      'Push back up with control',
    ],
    media: {
      image: PLACEHOLDER_IMAGES.incline_pushup,
      video: '',
      sounds: {
        start: '',
        halfway: '',
        end: '',
      },
    },
  },
  {
    id: 'dumbbell_row',
    name: 'Dumbbell Row',
    bodyArea: 'upper_body',
    equipment: ['dumbbells', 'chair_step'],
    intensity: 2,
    defaultDurationSec: 45,
    met: 5.0,
    description: 'Build a strong back and improve posture with this essential pulling movement.',
    coachingCues: [
      'Hinge forward with one hand supported',
      'Hold dumbbell with free hand',
      'Pull weight to hip, elbow back',
      'Lower with control',
    ],
    media: {
      image: PLACEHOLDER_IMAGES.dumbbell_row,
      video: '',
      sounds: {
        start: '',
        halfway: '',
        end: '',
      },
    },
  },
  {
    id: 'high_knees',
    name: 'High Knees',
    bodyArea: 'cardio',
    equipment: ['bodyweight'],
    intensity: 3,
    defaultDurationSec: 30,
    met: 9.0,
    description: 'An explosive cardio move that spikes your heart rate and improves coordination.',
    coachingCues: [
      'Run in place with high knee lift',
      'Bring knees to hip height',
      'Pump arms opposite to legs',
      'Stay on balls of feet',
    ],
    media: {
      image: PLACEHOLDER_IMAGES.high_knees,
      video: '',
      sounds: {
        start: '',
        halfway: '',
        end: '',
      },
    },
  },
  {
    id: 'childs_pose',
    name: 'Child\'s Pose',
    bodyArea: 'stretch',
    equipment: ['mat'],
    intensity: 1,
    defaultDurationSec: 60,
    met: 2.0,
    description: 'A restorative stretch that releases tension in the back, hips, and shoulders.',
    coachingCues: [
      'Kneel with big toes touching',
      'Sit back on heels',
      'Extend arms forward on floor',
      'Rest forehead down and breathe',
    ],
    media: {
      image: PLACEHOLDER_IMAGES.childs_pose,
      video: '',
      sounds: {
        start: '',
        halfway: '',
        end: '',
      },
    },
  },
];

export const getExerciseById = (id: string): Exercise | undefined => {
  return EXERCISES.find((e) => e.id === id);
};

export const getExercisesByBodyArea = (bodyArea: string): Exercise[] => {
  if (bodyArea === 'all') return EXERCISES;
  return EXERCISES.filter((e) => e.bodyArea === bodyArea);
};

export const getExercisesByEquipment = (equipmentIds: string[]): Exercise[] => {
  if (equipmentIds.length === 0) return EXERCISES;
  return EXERCISES.filter((e) => 
    equipmentIds.some((eq) => e.equipment.includes(eq as any))
  );
};
