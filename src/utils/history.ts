import { ExerciseLog, DailySummary, PeriodSummary, StreakData } from '@/src/types/history';

/**
 * HISTORY UTILITY FUNCTIONS
 * 
 * These pure functions help process exercise logs for display:
 * - Grouping logs by date for calendar
 * - Filtering by time period (week, month)
 * - Calculating streaks for motivation
 * 
 * All functions work with local dates (YYYY-MM-DD format).
 */

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function groupLogsByDate(logs: ExerciseLog[]): Record<string, DailySummary> {
  const grouped: Record<string, DailySummary> = {};
  
  for (const log of logs) {
    if (!grouped[log.date]) {
      grouped[log.date] = {
        date: log.date,
        totalDurationSeconds: 0,
        totalCalories: 0,
        logs: [],
      };
    }
    
    grouped[log.date].totalDurationSeconds += log.durationSeconds;
    grouped[log.date].totalCalories += log.calories ?? 0;
    grouped[log.date].logs.push(log);
  }
  
  return grouped;
}

export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfMonth(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getLogsForPeriod(
  logs: ExerciseLog[],
  startDate: Date,
  endDate: Date = new Date()
): ExerciseLog[] {
  const startStr = getLocalDateString(startDate);
  const endStr = getLocalDateString(endDate);
  
  return logs.filter(log => log.date >= startStr && log.date <= endStr);
}

export function getWeekLogs(logs: ExerciseLog[]): ExerciseLog[] {
  return getLogsForPeriod(logs, getStartOfWeek());
}

export function getMonthLogs(logs: ExerciseLog[]): ExerciseLog[] {
  return getLogsForPeriod(logs, getStartOfMonth());
}

export function getTodayLogs(logs: ExerciseLog[]): ExerciseLog[] {
  const today = getLocalDateString();
  return logs.filter(log => log.date === today);
}

export function calculatePeriodSummary(logs: ExerciseLog[]): PeriodSummary {
  return {
    totalDurationSeconds: logs.reduce((sum, log) => sum + log.durationSeconds, 0),
    totalCalories: logs.reduce((sum, log) => sum + (log.calories ?? 0), 0),
    workoutCount: logs.length,
    logs,
  };
}

/**
 * STREAK CALCULATION
 * 
 * Calculates consecutive workout days.
 * - currentStreak: consecutive days ending with today or yesterday
 * - bestStreak: longest ever streak
 * 
 * A day counts if at least one workout exists for that date.
 */
export function calculateStreak(logs: ExerciseLog[]): StreakData {
  if (logs.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }
  
  const uniqueDates = [...new Set(logs.map(log => log.date))].sort();
  
  if (uniqueDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }
  
  let bestStreak = 1;
  let currentCount = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentCount++;
      bestStreak = Math.max(bestStreak, currentCount);
    } else {
      currentCount = 1;
    }
  }
  
  const today = getLocalDateString();
  const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
  const lastWorkoutDate = uniqueDates[uniqueDates.length - 1];
  
  let currentStreak = 0;
  
  if (lastWorkoutDate === today || lastWorkoutDate === yesterday) {
    currentStreak = 1;
    
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const currDate = new Date(uniqueDates[i + 1]);
      const prevDate = new Date(uniqueDates[i]);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  return { currentStreak, bestStreak };
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  if (secs === 0) {
    return `${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

export function formatMinutes(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins}`;
}

export function getMotivationalMessage(durationSeconds: number): {
  message: string;
  emoji: string;
} {
  const mins = durationSeconds / 60;
  
  if (mins < 5) {
    return {
      message: "Small steps still count. You showed up!",
      emoji: "💪",
    };
  } else if (mins <= 20) {
    return {
      message: "Great job, your consistency is building strength!",
      emoji: "✨",
    };
  } else {
    return {
      message: "Powerful session! You're rewriting your story!",
      emoji: "🔥",
    };
  }
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
