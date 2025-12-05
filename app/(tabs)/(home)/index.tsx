import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import {
  Play,
  Clock,
  Flame,
  ChevronRight,
  CalendarDays,
  Trophy,
  Zap,
  Target,
  Award,
} from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { EXERCISES } from '@/src/data/exercises';
import { ExerciseLog, DailySummary, PeriodSummary, StreakData } from '@/src/types/history';
import { getExerciseLogs } from '@/src/storage/historyStorage';
import {
  groupLogsByDate,
  getTodayLogs,
  getWeekLogs,
  getMonthLogs,
  calculatePeriodSummary,
  calculateStreak,
  formatMinutes,
  getGreeting,
  getLocalDateString,
} from '@/src/utils/history';

/**
 * HOME SCREEN - MOTIVATIONAL DASHBOARD
 * 
 * This screen displays:
 * - Personalized greeting and current streak
 * - Quick stats (today, week, month)
 * - Interactive calendar showing workout days
 * - Daily summary when a date is selected
 * - Achievement cards for motivation
 * 
 * All workout history is stored locally on the device using AsyncStorage.
 * The data is loaded when the screen gains focus to show the latest stats.
 */

type MarkedDates = {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    selectedTextColor?: string;
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors, customIconColor, customContainerColor } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [, setLogs] = useState<ExerciseLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [todaySummary, setTodaySummary] = useState<PeriodSummary>({ totalDurationSeconds: 0, totalCalories: 0, workoutCount: 0, logs: [] });
  const [weekSummary, setWeekSummary] = useState<PeriodSummary>({ totalDurationSeconds: 0, totalCalories: 0, workoutCount: 0, logs: [] });
  const [monthSummary, setMonthSummary] = useState<PeriodSummary>({ totalDurationSeconds: 0, totalCalories: 0, workoutCount: 0, logs: [] });
  const [streakData, setStreakData] = useState<StreakData>({ currentStreak: 0, bestStreak: 0 });
  const [dailySummaries, setDailySummaries] = useState<Record<string, DailySummary>>({});
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  /**
   * LOADING EXERCISE HISTORY
   * 
   * We load all exercise logs from local storage and compute:
   * - Daily summaries for the calendar
   * - Period summaries (today, week, month)
   * - Streak data (current and best)
   * - Calendar markers showing workout intensity
   */
  const loadHistory = useCallback(async () => {
    console.log('Loading exercise history for dashboard...');
    const allLogs = await getExerciseLogs();
    setLogs(allLogs);

    const grouped = groupLogsByDate(allLogs);
    setDailySummaries(grouped);

    const todayLogs = getTodayLogs(allLogs);
    const weekLogs = getWeekLogs(allLogs);
    const monthLogs = getMonthLogs(allLogs);

    setTodaySummary(calculatePeriodSummary(todayLogs));
    setWeekSummary(calculatePeriodSummary(weekLogs));
    setMonthSummary(calculatePeriodSummary(monthLogs));
    setStreakData(calculateStreak(allLogs));

    /**
     * CALENDAR MARKERS
     * 
     * We mark each day that has workouts with a dot.
     * The dot color intensity reflects total calories burned that day.
     */
    const marks: MarkedDates = {};
    Object.entries(grouped).forEach(([date, summary]) => {
      const intensity = Math.min(summary.totalCalories / 100, 1);
      const baseColor = colors.primary;
      marks[date] = {
        marked: true,
        dotColor: intensity > 0.5 ? colors.primaryDark : baseColor,
      };
    });

    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.white,
    };

    setMarkedDates(marks);
    console.log(`Loaded ${allLogs.length} logs, ${Object.keys(grouped).length} workout days`);
  }, [selectedDate, colors]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
    
    const marks: MarkedDates = {};
    Object.entries(dailySummaries).forEach(([date, summary]) => {
      const intensity = Math.min(summary.totalCalories / 100, 1);
      marks[date] = {
        marked: true,
        dotColor: intensity > 0.5 ? colors.primaryDark : colors.primary,
      };
    });
    marks[day.dateString] = {
      ...marks[day.dateString],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.white,
    };
    setMarkedDates(marks);
  };

  const isTablet = width >= 768;
  const featuredExercises = EXERCISES.slice(0, 3);
  const selectedDaySummary = dailySummaries[selectedDate];
  const greeting = getGreeting();

  const StatCard = ({
    icon: Icon,
    label,
    value,
    unit,
    color,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    unit: string;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} strokeWidth={2.2} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const AchievementCard = ({
    icon: Icon,
    title,
    unlocked,
    color,
  }: {
    icon: React.ElementType;
    title: string;
    unlocked: boolean;
    color: string;
  }) => {
    const scaleAnim = useRef(new Animated.Value(unlocked ? 0.8 : 1)).current;

    useEffect(() => {
      if (unlocked) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }).start();
      }
    }, [unlocked, scaleAnim]);

    return (
      <Animated.View
        style={[
          styles.achievementCard,
          !unlocked && styles.achievementCardLocked,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={unlocked ? [color, color + 'DD'] : [colors.border, colors.border]}
          style={styles.achievementGradient}
        >
          <Icon
            size={24}
            color={unlocked ? colors.white : colors.textLight}
            strokeWidth={2}
          />
        </LinearGradient>
        <Text style={[styles.achievementTitle, !unlocked && styles.achievementTitleLocked]}>
          {title}
        </Text>
      </Animated.View>
    );
  };

  const navigateToExercises = () => {
    router.push('/(tabs)/(exercises)' as any);
  };

  const navigateToProfile = () => {
    router.push('/(tabs)/(profile)' as any);
  };

  const navigateToExerciseDetail = (exerciseId: string) => {
    router.push({
      pathname: '/(tabs)/(exercises)/[exerciseId]' as any,
      params: { exerciseId },
    });
  };

  const hasWorkoutToday = todaySummary.workoutCount > 0;
  const monthMinutes = Math.floor(monthSummary.totalDurationSeconds / 60);
  const weekMinutes = Math.floor(weekSummary.totalDurationSeconds / 60);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMiddle, colors.background]}
      locations={[0, 0.3, 0.6]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && styles.scrollContentTablet,
          ]}
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.title}>
                {hasWorkoutToday ? "Great progress today!" : "Ready to train?"}
              </Text>
            </View>
            <Pressable style={styles.streakBadge} onPress={navigateToProfile}>
              <Flame size={18} color={colors.warning} strokeWidth={2.5} />
              <Text style={styles.streakText}>
                {streakData.currentStreak > 0 ? `${streakData.currentStreak} day${streakData.currentStreak > 1 ? 's' : ''}` : 'Start streak'}
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            style={[
              styles.heroCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={customContainerColor ? [customContainerColor, customContainerColor] : [colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroLabel}>{"THIS MONTH"}</Text>
                <Text style={styles.heroTitle}>
                  {monthSummary.totalCalories > 0
                    ? `${Math.round(monthSummary.totalCalories)} kcal`
                    : 'Start your journey'}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {monthMinutes > 0
                    ? `${monthMinutes} min • ${monthSummary.workoutCount} workout${monthSummary.workoutCount !== 1 ? 's' : ''}`
                    : 'Your future self is proud of you'}
                </Text>
                <Pressable
                  style={styles.heroButton}
                  onPress={navigateToExercises}
                >
                  <Play size={18} color={customContainerColor || colors.primary} fill={customContainerColor || colors.primary} />
                  <Text style={[styles.heroButtonText, customContainerColor && { color: customContainerColor }]}>Start Workout</Text>
                </Pressable>
              </View>
              <View style={styles.heroImageContainer}>
                <Image
                  source={{ uri: EXERCISES[0].media.image }}
                  style={styles.heroImage}
                  contentFit="cover"
                />
              </View>
            </LinearGradient>
          </Animated.View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsRow}>
              <StatCard
                icon={Target}
                label="Today"
                value={todaySummary.workoutCount}
                unit="workouts"
                color={colors.success}
              />
              <StatCard
                icon={Clock}
                label="This week"
                value={weekMinutes}
                unit="minutes"
                color={colors.secondary}
              />
              <StatCard
                icon={Flame}
                label="Best streak"
                value={streakData.bestStreak}
                unit="days"
                color={colors.warning}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <CalendarDays size={20} color={colors.text} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Workout Calendar</Text>
              </View>
            </View>
            
            <View style={styles.calendarCard}>
              <Calendar
                onDayPress={handleDateSelect}
                markedDates={markedDates}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: colors.textSecondary,
                  selectedDayBackgroundColor: customContainerColor || colors.primary,
                  selectedDayTextColor: colors.white,
                  todayTextColor: customContainerColor || colors.primary,
                  dayTextColor: colors.text,
                  textDisabledColor: colors.textLight,
                  dotColor: customContainerColor || colors.primary,
                  selectedDotColor: colors.white,
                  arrowColor: customContainerColor || colors.primary,
                  monthTextColor: colors.text,
                  textDayFontWeight: '500' as const,
                  textMonthFontWeight: '700' as const,
                  textDayHeaderFontWeight: '600' as const,
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 12,
                }}
                style={styles.calendar}
              />
            </View>

            <View style={styles.dailySummaryCard}>
              {selectedDaySummary ? (
                <>
                  <View style={styles.dailySummaryHeader}>
                    <Text style={styles.dailySummaryDate}>
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <View style={styles.dailySummaryStats}>
                      <View style={styles.dailyStat}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={styles.dailyStatText}>
                          {formatMinutes(selectedDaySummary.totalDurationSeconds)}m
                        </Text>
                      </View>
                      <View style={styles.dailyStat}>
                        <Flame size={14} color={colors.warning} />
                        <Text style={styles.dailyStatText}>
                          {Math.round(selectedDaySummary.totalCalories)} kcal
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.exerciseChips}>
                    {selectedDaySummary.logs.map((log, index) => (
                      <View key={log.id} style={styles.exerciseChip}>
                        <Text style={styles.exerciseChipText}>{log.exerciseName}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.noWorkoutContainer}>
                  <Text style={styles.noWorkoutText}>
                    {selectedDate === getLocalDateString()
                      ? "No workout yet. Today is a perfect day to move 🌸"
                      : "No workout on this day"}
                  </Text>
                  {selectedDate === getLocalDateString() && (
                    <Pressable style={styles.startWorkoutMini} onPress={navigateToExercises}>
                      <Text style={styles.startWorkoutMiniText}>Start Now</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Trophy size={20} color={colors.text} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Achievements</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsScroll}
            >
              <AchievementCard
                icon={Flame}
                title="3-Day Streak"
                unlocked={streakData.bestStreak >= 3}
                color={colors.warning}
              />
              <AchievementCard
                icon={Zap}
                title="10 Min Week"
                unlocked={weekMinutes >= 10}
                color={colors.secondary}
              />
              <AchievementCard
                icon={Target}
                title="30 Min Month"
                unlocked={monthMinutes >= 30}
                color={colors.success}
              />
              <AchievementCard
                icon={Award}
                title="100 kcal Burner"
                unlocked={monthSummary.totalCalories >= 100}
                color={colors.primary}
              />
              <AchievementCard
                icon={Trophy}
                title="7-Day Warrior"
                unlocked={streakData.bestStreak >= 7}
                color="#FFD700"
              />
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Start</Text>
              <Pressable
                style={styles.seeAllButton}
                onPress={navigateToExercises}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={colors.primary} />
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredExercises.map((exercise, index) => (
                <Pressable
                  key={exercise.id}
                  style={[
                    styles.featuredCard,
                    index === featuredExercises.length - 1 && { marginRight: 0 },
                  ]}
                  onPress={() => navigateToExerciseDetail(exercise.id)}
                >
                  <Image
                    source={{ uri: exercise.media.image }}
                    style={styles.featuredImage}
                    contentFit="cover"
                  />
                  <View style={styles.featuredOverlay} />
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredName}>{exercise.name}</Text>
                    <Text style={styles.featuredDuration}>
                      {exercise.defaultDurationSec}s
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.motivationCard}>
            <Text style={styles.motivationQuote}>
              {streakData.currentStreak > 0
                ? `"You've shown up ${streakData.currentStreak} day${streakData.currentStreak > 1 ? 's' : ''} in a row. That's real commitment!"`
                : '"The secret of getting ahead is getting started."'}
            </Text>
            <Text style={styles.motivationAuthor}>
              {streakData.currentStreak > 0 ? '— Your HomeFit Journey' : '— Mark Twain'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  scrollContentTablet: {
    paddingHorizontal: 40,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroGradient: {
    flexDirection: 'row',
    padding: 18,
    minHeight: 160,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  heroImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 0,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textLight,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  calendarCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  calendar: {
    borderRadius: 12,
  },
  dailySummaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dailySummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailySummaryDate: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
  },
  dailySummaryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  dailyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dailyStatText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  exerciseChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseChip: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  exerciseChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.text,
  },
  noWorkoutContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  noWorkoutText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  startWorkoutMini: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startWorkoutMiniText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.white,
  },
  achievementsScroll: {
    paddingRight: 20,
  },
  achievementCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementGradient: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: colors.textLight,
  },
  featuredScroll: {
    paddingRight: 20,
  },
  featuredCard: {
    width: 140,
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 14,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.white,
    marginBottom: 4,
  },
  featuredDuration: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  motivationCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  motivationQuote: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  motivationAuthor: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
});
