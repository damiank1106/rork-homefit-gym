import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseLog } from '@/src/types/history';

/**
 * HISTORY STORAGE
 * 
 * This file handles saving and loading workout history locally on the device.
 * Each completed exercise is saved as an ExerciseLog entry, which includes:
 * - Exercise details (name, body area, duration)
 * - Calorie burn estimate (if user has set their weight)
 * - Timestamp for tracking when the workout was done
 * 
 * This data powers:
 * - The calendar view (showing which days had workouts)
 * - Streak calculations (consecutive workout days)
 * - Weekly/monthly statistics
 * - Motivational achievements
 */

const HISTORY_STORAGE_KEY = 'homefit_exercise_logs_v1';

export async function getExerciseLogs(): Promise<ExerciseLog[]> {
  try {
    console.log('Loading exercise logs from storage...');
    const storedData = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    
    if (!storedData) {
      console.log('No exercise logs found in storage');
      return [];
    }
    
    const logs = JSON.parse(storedData) as ExerciseLog[];
    console.log(`Loaded ${logs.length} exercise logs`);
    return logs;
  } catch (error) {
    console.error('Error loading exercise logs:', error);
    // Clear corrupted data
    try {
      await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
      console.log('Cleared corrupted exercise logs');
    } catch (clearError) {
      console.error('Error clearing corrupted logs:', clearError);
    }
    return [];
  }
}

export async function addExerciseLog(log: ExerciseLog): Promise<void> {
  try {
    console.log('Saving exercise log:', log);
    
    const existingLogs = await getExerciseLogs();
    const updatedLogs = [...existingLogs, log];
    
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedLogs));
    console.log('Exercise log saved successfully. Total logs:', updatedLogs.length);
  } catch (error) {
    console.error('Error saving exercise log:', error);
  }
}


export async function deleteExerciseLog(logId: string): Promise<void> {
  try {
    console.log('Deleting exercise log:', logId);
    const existingLogs = await getExerciseLogs();
    const updatedLogs = existingLogs.filter((log) => log.id !== logId);
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedLogs));
    console.log('Exercise log deleted successfully');
  } catch (error) {
    console.error('Error deleting exercise log:', error);
  }
}

export async function clearAllLogs(): Promise<void> {
  try {
    console.log('Clearing all exercise logs...');
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
    console.log('All exercise logs cleared successfully');
  } catch (error) {
    console.error('Error clearing all exercise logs:', error);
  }
}
