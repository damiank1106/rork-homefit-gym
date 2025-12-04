import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Play, Pause, RotateCcw, X, CheckCircle, Flame, Clock, ArrowLeft, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getExerciseById } from '@/src/data/exercises';
import { UserProfile } from '@/src/types/profile';
import { ExerciseLog } from '@/src/types/history';
import { loadUserProfile } from '@/src/storage/profileStorage';
import { addExerciseLog } from '@/src/storage/historyStorage';
import { calculateCalories, formatCalories } from '@/src/utils/calories';
import { getLocalDateString, formatDuration, getMotivationalMessage } from '@/src/utils/history';

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export default function TimerScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const router = useRouter();
  const exercise = getExerciseById(exerciseId ?? '');

  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [remainingTime, setRemainingTime] = useState(exercise?.defaultDurationSec ?? 0);
  const [halfwayPlayed, setHalfwayPlayed] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessionSaved, setSessionSaved] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const summarySlideAnim = useRef(new Animated.Value(100)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const totalDuration = exercise?.defaultDurationSec ?? 0;
  const halfwayPoint = Math.floor(totalDuration / 2);
  const progress = totalDuration > 0 ? (totalDuration - remainingTime) / totalDuration : 0;
  const elapsedSeconds = totalDuration - remainingTime;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    console.log('Loading user profile for calorie calculation...');
    const profile = await loadUserProfile();
    setUserProfile(profile);
    console.log('Profile loaded for timer:', profile?.weight, profile?.weightUnit);
  };

  const currentCalories = exercise
    ? calculateCalories(
        exercise.met,
        userProfile?.weight ?? null,
        userProfile?.weightUnit ?? 'kg',
        elapsedSeconds
      )
    : null;

  const finalCalories = exercise
    ? calculateCalories(
        exercise.met,
        userProfile?.weight ?? null,
        userProfile?.weightUnit ?? 'kg',
        totalDuration - remainingTime
      )
    : null;

  /**
   * SAVE COMPLETED SESSION
   * 
   * This function is called when a workout is completed (either naturally or early).
   * It saves the exercise log to local storage, which includes:
   * - Exercise details (id, name, body area)
   * - Duration actually performed
   * - Estimated calories burned (if user weight is set)
   * - Timestamps for tracking
   * 
   * This data powers the calendar, streaks, and stats on the Home screen.
   */
  const saveCompletedSession = useCallback(async () => {
    if (!exercise || sessionSaved) return;

    const actualElapsed = Math.max(1, totalDuration - remainingTime);
    
    const calories = calculateCalories(
      exercise.met,
      userProfile?.weight ?? null,
      userProfile?.weightUnit ?? 'kg',
      actualElapsed
    );

    const log: ExerciseLog = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      bodyArea: exercise.bodyArea,
      date: getLocalDateString(),
      timestamp: new Date().toISOString(),
      durationSeconds: actualElapsed,
      calories: calories !== null ? Math.round(calories * 10) / 10 : null,
    };

    console.log('Saving completed session:', log);
    
    try {
      await addExerciseLog(log);
      setSessionSaved(true);
      console.log('Session saved successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }, [exercise, userProfile, totalDuration, remainingTime, sessionSaved]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  useEffect(() => {
    if (timerState === 'running') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timerState, pulseAnim]);

  useEffect(() => {
    if (timerState === 'completed') {
      Animated.parallel([
        Animated.spring(summarySlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
      
      saveCompletedSession();
    } else {
      summarySlideAnim.setValue(100);
      celebrationAnim.setValue(0);
    }
  }, [timerState, summarySlideAnim, celebrationAnim, saveCompletedSession]);

  const playSound = useCallback(async (type: 'start' | 'halfway' | 'end') => {
    try {
      console.log(`Playing ${type} sound`);
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(
          type === 'end' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium
        );
      }
    } catch (error) {
      console.log('Sound/haptic error:', error);
    }
  }, []);

  const startTimer = useCallback(() => {
    console.log('Timer started');
    setTimerState('running');
    setHalfwayPlayed(false);
    setSessionSaved(false);
    playSound('start');

    intervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimerState('completed');
          playSound('end');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [playSound]);

  const pauseTimer = useCallback(() => {
    console.log('Timer paused');
    setTimerState('paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const resumeTimer = useCallback(() => {
    console.log('Timer resumed');
    setTimerState('running');

    intervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimerState('completed');
          playSound('end');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [playSound]);

  const resetTimer = useCallback(() => {
    console.log('Timer reset');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerState('idle');
    setRemainingTime(totalDuration);
    setHalfwayPlayed(false);
    setSessionSaved(false);
    progressAnim.setValue(0);
  }, [totalDuration, progressAnim]);

  const finishEarly = useCallback(() => {
    console.log('Timer finished early by user');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerState('completed');
    playSound('end');
  }, [playSound]);

  useEffect(() => {
    if (
      timerState === 'running' &&
      !halfwayPlayed &&
      remainingTime <= halfwayPoint &&
      remainingTime > 0
    ) {
      console.log('Halfway point reached');
      playSound('halfway');
      setHalfwayPlayed(true);
    }
  }, [remainingTime, timerState, halfwayPlayed, halfwayPoint, playSound]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exercise) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>Exercise not found</Text>
      </SafeAreaView>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const actualElapsed = totalDuration - remainingTime;
  const motivational = getMotivationalMessage(actualElapsed);

  return (
    <LinearGradient
      colors={
        timerState === 'completed'
          ? ['#7BC9A4', '#5BA87C', '#4A9770']
          : [Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]
      }
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <X size={28} color={timerState === 'completed' ? Colors.white : Colors.text} strokeWidth={2} />
          </Pressable>

          <View style={styles.exerciseInfo}>
            <Text style={[
              styles.exerciseName,
              timerState === 'completed' && styles.exerciseNameCompleted
            ]}>
              {exercise.name}
            </Text>
            <Text style={[
              styles.exerciseTarget,
              timerState === 'completed' && styles.exerciseTargetCompleted
            ]}>
              {timerState === 'completed' ? 'Workout Complete! 🎉' : `Target: ${totalDuration}s`}
            </Text>
          </View>

          <View style={styles.timerContainer}>
            <Animated.View
              style={[
                styles.timerCircle,
                timerState === 'completed' && styles.timerCircleCompleted,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {timerState === 'completed' ? (
                <Animated.View style={{ opacity: celebrationAnim }}>
                  <CheckCircle size={80} color={Colors.white} strokeWidth={1.5} />
                </Animated.View>
              ) : (
                <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
              )}
            </Animated.View>
          </View>

          {timerState !== 'completed' && (
            <View style={styles.caloriesContainer}>
              <Flame size={18} color={Colors.warning} strokeWidth={2} />
              {currentCalories !== null ? (
                <Text style={styles.caloriesText}>
                  Estimated: {formatCalories(currentCalories)}
                </Text>
              ) : (
                <Text style={styles.caloriesHint}>
                  Set your weight in Profile to see calorie estimates
                </Text>
              )}
            </View>
          )}

          <View style={styles.progressContainer}>
            <View style={[
              styles.progressBar,
              timerState === 'completed' && styles.progressBarCompleted
            ]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth },
                  timerState === 'completed' && styles.progressFillCompleted,
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={[
                styles.progressLabel,
                timerState === 'completed' && styles.progressLabelCompleted
              ]}>0:00</Text>
              <Text style={[
                styles.progressLabel,
                timerState === 'completed' && styles.progressLabelCompleted
              ]}>{formatTime(totalDuration)}</Text>
            </View>
          </View>

          {timerState === 'completed' ? (
            <Animated.View 
              style={[
                styles.summaryCard,
                { transform: [{ translateY: summarySlideAnim }] }
              ]}
            >
              <View style={styles.motivationalBanner}>
                <Text style={styles.motivationalEmoji}>{motivational.emoji}</Text>
                <Text style={styles.motivationalText}>{motivational.message}</Text>
              </View>

              <View style={styles.summaryStats}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Clock size={22} color={Colors.primary} strokeWidth={2} />
                    <Text style={styles.summaryLabel}>Duration</Text>
                    <Text style={styles.summaryValue}>
                      {formatDuration(actualElapsed)}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryDivider} />
                  
                  <View style={styles.summaryItem}>
                    <Flame size={22} color={Colors.warning} strokeWidth={2} />
                    <Text style={styles.summaryLabel}>Calories</Text>
                    <Text style={styles.summaryValue}>
                      {finalCalories !== null ? `~${finalCalories.toFixed(1)}` : '—'}
                    </Text>
                  </View>
                </View>
              </View>

              {finalCalories === null && (
                <Text style={styles.summaryHint}>
                  Add your weight in Profile to track calories
                </Text>
              )}
              
              <View style={styles.summaryActions}>
                <Pressable style={styles.outlineButton} onPress={resetTimer}>
                  <RotateCcw size={18} color={Colors.text} strokeWidth={2} />
                  <Text style={styles.outlineButtonText}>Again</Text>
                </Pressable>
                <Pressable style={styles.primaryButton} onPress={handleClose}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.buttonGradient}
                  >
                    <ArrowLeft size={20} color={Colors.white} />
                    <Text style={styles.buttonText}>Done</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Animated.View>
          ) : (
            <View style={styles.controlsContainer}>
              {timerState === 'idle' && (
                <Pressable style={styles.primaryButton} onPress={startTimer}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.buttonGradient}
                  >
                    <Play size={32} color={Colors.white} fill={Colors.white} />
                    <Text style={styles.buttonText}>Start</Text>
                  </LinearGradient>
                </Pressable>
              )}

              {timerState === 'running' && (
                <View style={styles.runningControls}>
                  <Pressable style={styles.finishButton} onPress={finishEarly}>
                    <Check size={22} color={Colors.success} strokeWidth={2.5} />
                  </Pressable>
                  <Pressable style={styles.primaryButton} onPress={pauseTimer}>
                    <LinearGradient
                      colors={[Colors.secondary, Colors.secondaryDark]}
                      style={styles.buttonGradient}
                    >
                      <Pause size={32} color={Colors.white} fill={Colors.white} />
                      <Text style={styles.buttonText}>Pause</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}

              {timerState === 'paused' && (
                <View style={styles.runningControls}>
                  <Pressable style={styles.finishButton} onPress={finishEarly}>
                    <Check size={22} color={Colors.success} strokeWidth={2.5} />
                  </Pressable>
                  <Pressable style={styles.primaryButton} onPress={resumeTimer}>
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryDark]}
                      style={styles.buttonGradient}
                    >
                      <Play size={32} color={Colors.white} fill={Colors.white} />
                      <Text style={styles.buttonText}>Resume</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {timerState !== 'completed' && (
            <View style={styles.coachingCue}>
              <Text style={styles.coachingLabel}>Focus on:</Text>
              <Text style={styles.coachingText}>
                {exercise.coachingCues[Math.floor(progress * exercise.coachingCues.length)] ||
                  exercise.coachingCues[0]}
              </Text>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginTop: 8,
  },
  exerciseInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  exerciseNameCompleted: {
    color: Colors.white,
  },
  exerciseTarget: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  exerciseTargetCompleted: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  timerCircleCompleted: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200' as const,
    color: Colors.text,
    letterSpacing: -2,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  caloriesText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  caloriesHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    maxWidth: 220,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarCompleted: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressFillCompleted: {
    backgroundColor: Colors.white,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressLabelCompleted: {
    color: 'rgba(255,255,255,0.8)',
  },
  controlsContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  finishButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  runningControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  motivationalBanner: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  motivationalEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  summaryStats: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  summaryHint: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 8,
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  coachingCue: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  coachingLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  coachingText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
    lineHeight: 24,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
});
