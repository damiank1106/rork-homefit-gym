/**
 * CALORIE CALCULATION UTILITY
 * 
 * This function calculates estimated calories burned during exercise using the MET formula.
 * MET (Metabolic Equivalent of Task) represents the energy cost of an activity.
 * 
 * Formula: kcal/min = (MET × 3.5 × weight in kg) / 200
 * Total kcal = kcal/min × duration in minutes
 * 
 * FUTURE PHASE: These calculations will be saved with workout history
 * to build statistics and track progress over time.
 */

export function calculateCalories(
  met: number,
  weight: number | null,
  weightUnit: 'kg' | 'lb',
  durationSeconds: number
): number | null {
  if (weight === null || weight <= 0) {
    return null;
  }

  const weightKg = weightUnit === 'lb' ? weight * 0.453592 : weight;
  
  const kcalPerMin = (met * 3.5 * weightKg) / 200;
  const durationMinutes = durationSeconds / 60;
  const totalKcal = kcalPerMin * durationMinutes;
  
  return Math.round(totalKcal * 10) / 10;
}

export function formatCalories(calories: number | null): string {
  if (calories === null) {
    return '—';
  }
  return `${calories.toFixed(1)} kcal`;
}
