import React, { useRef, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import {
  Play,
  Clock,
  Flame,
  TrendingUp,
  ChevronRight,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { EXERCISES } from '@/src/data/exercises';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const isTablet = width >= 768;
  const featuredExercises = EXERCISES.slice(0, 3);

  const QuickActionCard = ({
    icon: Icon,
    title,
    subtitle,
    color,
    onPress,
  }: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    color: string;
    onPress: () => void;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
        <Pressable
          onPress={onPress}
          onPressIn={() => {
            Animated.spring(scaleAnim, {
              toValue: 0.96,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }).start();
          }}
          style={styles.quickActionCard}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
            <Icon size={22} color={Colors.white} strokeWidth={2.2} />
          </View>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        </Pressable>
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

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.background]}
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
              <Text style={styles.greeting}>Good morning</Text>
              <Text style={styles.title}>Ready to train?</Text>
            </View>
            <View style={styles.streakBadge}>
              <Flame size={18} color={Colors.warning} strokeWidth={2.5} />
              <Text style={styles.streakText}>7 days</Text>
            </View>
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
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroLabel}>{"TODAY'S WORKOUT"}</Text>
                <Text style={styles.heroTitle}>Full Body Burn</Text>
                <Text style={styles.heroSubtitle}>
                  20 min • 8 exercises • Intermediate
                </Text>
                <Pressable
                  style={styles.heroButton}
                  onPress={navigateToExercises}
                >
                  <Play size={18} color={Colors.primary} fill={Colors.primary} />
                  <Text style={styles.heroButtonText}>Start Now</Text>
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
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={[styles.quickActionsRow, isTablet && styles.quickActionsRowTablet]}>
              <QuickActionCard
                icon={Clock}
                title="Quick Workout"
                subtitle="10 min"
                color={Colors.secondary}
                onPress={navigateToExercises}
              />
              <QuickActionCard
                icon={TrendingUp}
                title="My Progress"
                subtitle="View stats"
                color={Colors.success}
                onPress={navigateToProfile}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Exercises</Text>
              <Pressable
                style={styles.seeAllButton}
                onPress={navigateToExercises}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={Colors.primary} />
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
              {'"Strength doesn\'t come from what you can do. It comes from overcoming the things you once thought you couldn\'t."'}
            </Text>
            <Text style={styles.motivationAuthor}>— Rikki Rogers</Text>
          </View>
        </ScrollView>
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
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroGradient: {
    flexDirection: 'row',
    padding: 24,
    minHeight: 180,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 18,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  heroImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  quickActionsRowTablet: {
    gap: 20,
  },
  quickActionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  featuredScroll: {
    paddingRight: 20,
  },
  featuredCard: {
    width: 160,
    height: 200,
    borderRadius: 20,
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
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  featuredDuration: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  motivationCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  motivationQuote: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  motivationAuthor: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
});
