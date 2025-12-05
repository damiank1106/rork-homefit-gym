import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/src/context/ThemeContext';
import { Exercise, BODY_AREA_LABELS } from '@/src/types/training';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: () => void;
  index: number;
}

export default function ExerciseCard({ exercise, onPress, index }: ExerciseCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const renderIntensityDots = () => {
    return (
      <View style={styles.intensityContainer}>
        {[1, 2, 3].map((level) => (
          <View
            key={level}
            style={[
              styles.intensityDot,
              level <= exercise.intensity && styles.intensityDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY }, { scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
        testID={`exercise-card-${exercise.id}`}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: exercise.media.image }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.overlay} />
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{exercise.defaultDurationSec}s</Text>
          </View>
        </View>
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {exercise.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.bodyArea}>
              {BODY_AREA_LABELS[exercise.bodyArea]}
            </Text>
            {renderIntensityDots()}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  cardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  durationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D2D3A', // Force dark text on white badge
  },
  content: {
    padding: 14,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bodyArea: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  intensityContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  intensityDotActive: {
    backgroundColor: colors.primary,
  },
});
