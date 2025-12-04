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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Play, Clock, Flame, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getExerciseById } from '@/src/data/exercises';
import { BODY_AREA_LABELS, INTENSITY_LABELS } from '@/src/types/training';

export default function ExerciseDetailScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const exercise = getExerciseById(exerciseId ?? '');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  if (!exercise) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>Exercise not found</Text>
      </SafeAreaView>
    );
  }

  const isTablet = width >= 768;
  const imageHeight = isTablet ? height * 0.5 : height * 0.4;

  const handleStartTimer = () => {
    console.log('Starting timer for exercise:', exerciseId);
    router.push({
      pathname: '/(tabs)/(exercises)/timer' as any,
      params: { exerciseId },
    });
  };

  const InfoBadge = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
  }) => (
    <View style={styles.infoBadge}>
      <Icon size={18} color={Colors.primary} strokeWidth={2.2} />
      <View>
        <Text style={styles.infoBadgeLabel}>{label}</Text>
        <Text style={styles.infoBadgeValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        <Image
          source={{ uri: exercise.media.image }}
          style={styles.image}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageGradient}
        />
      </View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && styles.scrollContentTablet,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{exercise.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.areaBadge}>
                <Text style={styles.areaBadgeText}>
                  {BODY_AREA_LABELS[exercise.bodyArea]}
                </Text>
              </View>
              <View style={styles.intensityBadge}>
                <Text style={styles.intensityBadgeText}>
                  {INTENSITY_LABELS[exercise.intensity]}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <InfoBadge
              icon={Clock}
              label="Duration"
              value={`${exercise.defaultDurationSec}s`}
            />
            <InfoBadge
              icon={Flame}
              label="MET Value"
              value={exercise.met.toString()}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{exercise.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coaching Cues</Text>
            {exercise.coachingCues.map((cue, index) => (
              <View key={index} style={styles.cueItem}>
                <View style={styles.cueNumber}>
                  <Text style={styles.cueNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.cueText}>{cue}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment Needed</Text>
            <View style={styles.equipmentRow}>
              {exercise.equipment.map((eq) => (
                <View key={eq} style={styles.equipmentBadge}>
                  <CheckCircle size={14} color={Colors.success} />
                  <Text style={styles.equipmentText}>
                    {eq.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      <View style={styles.bottomContainer}>
        <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButtonGradient}
          >
            <Pressable
              style={styles.startButton}
              onPress={handleStartTimer}
              testID="start-timer-button"
            >
              <Play size={24} color={Colors.white} fill={Colors.white} />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </Pressable>
          </LinearGradient>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    marginTop: '35%',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    padding: 24,
  },
  scrollContentTablet: {
    paddingHorizontal: 40,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  areaBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  areaBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primaryDark,
  },
  intensityBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  intensityBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  infoBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoBadgeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoBadgeValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  cueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 14,
  },
  cueNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cueNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  cueText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    paddingTop: 3,
  },
  equipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  equipmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  equipmentText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomSafeArea: {
    paddingBottom: 8,
  },
  startButtonGradient: {
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
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
