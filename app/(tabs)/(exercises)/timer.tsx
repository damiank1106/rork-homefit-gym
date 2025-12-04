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
import { Play, Pause, RotateCcw, X, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getExerciseById } from '@/src/data/exercises';

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export default function TimerScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const router = useRouter();
  const exercise = getExerciseById(exerciseId ?? '');

  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [remainingTime, setRemainingTime] = useState(exercise?.defaultDurationSec ?? 0);
  const [halfwayPlayed, setHalfwayPlayed] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const totalDuration = exercise?.defaultDurationSec ?? 0;
  const halfwayPoint = Math.floor(totalDuration / 2);
  const progress = totalDuration > 0 ? (totalDuration - remainingTime) / totalDuration : 0;

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
    progressAnim.setValue(0);
  }, [totalDuration, progressAnim]);

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

  return (
    <LinearGradient
      colors={
        timerState === 'completed'
          ? [Colors.success, '#5BA87C']
          : [Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]
      }
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <X size={28} color={Colors.text} strokeWidth={2} />
          </Pressable>

          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseTarget}>
              {timerState === 'completed' ? 'Workout Complete!' : `Target: ${totalDuration}s`}
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
                <CheckCircle size={80} color={Colors.white} strokeWidth={1.5} />
              ) : (
                <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
              )}
            </Animated.View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth },
                  timerState === 'completed' && styles.progressFillCompleted,
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>0:00</Text>
              <Text style={styles.progressLabel}>{formatTime(totalDuration)}</Text>
            </View>
          </View>

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
                <Pressable style={styles.secondaryButton} onPress={resetTimer}>
                  <RotateCcw size={24} color={Colors.text} strokeWidth={2} />
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
                <Pressable style={styles.secondaryButton} onPress={resetTimer}>
                  <RotateCcw size={24} color={Colors.text} strokeWidth={2} />
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

            {timerState === 'completed' && (
              <View style={styles.completedControls}>
                <Pressable style={styles.outlineButton} onPress={resetTimer}>
                  <RotateCcw size={20} color={Colors.text} strokeWidth={2} />
                  <Text style={styles.outlineButtonText}>Try Again</Text>
                </Pressable>
                <Pressable style={styles.primaryButton} onPress={handleClose}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.buttonGradient}
                  >
                    <CheckCircle size={24} color={Colors.white} />
                    <Text style={styles.buttonText}>Done</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>

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
  exerciseTarget: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: Colors.success,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200' as const,
    color: Colors.text,
    letterSpacing: -2,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
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
  secondaryButton: {
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
  },
  runningControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  completedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.text,
    gap: 8,
  },
  outlineButtonText: {
    fontSize: 16,
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
    textTransform: 'uppercase',
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
