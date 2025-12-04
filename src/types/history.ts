import { BodyArea } from './training';

/**
 * EXERCISE LOG TYPE
 * 
 * Each time a workout is completed, we save an ExerciseLog entry.
 * This data is stored locally on the device using AsyncStorage and is used to:
 * - Display workout history in the calendar
 * - Calculate streaks and achievements
 * - Show motivational stats on the Home screen
 */
export interface ExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  bodyArea: BodyArea;
  date: string;
  timestamp: string;
  durationSeconds: number;
  calories: number | null;
}

/**
 * DAILY SUMMARY TYPE
 * 
 * A computed type that aggregates all workouts for a single day.
 * Used for calendar display and daily statistics.
 */
export interface DailySummary {
  date: string;
  totalDurationSeconds: number;
  totalCalories: number;
  logs: ExerciseLog[];
}

/**
 * PERIOD SUMMARY TYPE
 * 
 * Aggregated stats for a time period (week, month).
 */
export interface PeriodSummary {
  totalDurationSeconds: number;
  totalCalories: number;
  workoutCount: number;
  logs: ExerciseLog[];
}

/**
 * STREAK DATA TYPE
 * 
 * Tracks consecutive workout days.
 */
export interface StreakData {
  currentStreak: number;
  bestStreak: number;
}
