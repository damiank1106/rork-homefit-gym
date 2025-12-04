import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Search, Filter } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { EXERCISES } from '@/src/data/exercises';
import { EQUIPMENT } from '@/src/data/equipment';
import { BodyArea, EquipmentId } from '@/src/types/training';
import { UserProfile } from '@/src/types/profile';
import { loadUserProfile } from '@/src/storage/profileStorage';
import ExerciseCard from '@/src/components/ExerciseCard';
import FilterChip from '@/src/components/FilterChip';
import EquipmentChip from '@/src/components/EquipmentChip';

type BodyAreaFilter = 'all' | BodyArea;

const BODY_AREA_FILTERS: { key: BodyAreaFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'full_body', label: 'Full Body' },
  { key: 'legs_glutes', label: 'Legs & Glutes' },
  { key: 'core', label: 'Core' },
  { key: 'upper_body', label: 'Upper Body' },
  { key: 'cardio', label: 'Cardio' },
  { key: 'stretch', label: 'Stretch' },
];

export default function ExercisesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedBodyArea, setSelectedBodyArea] = useState<BodyAreaFilter>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentId[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [useMyEquipmentOnly, setUseMyEquipmentOnly] = useState(false);

  const isTablet = width >= 768;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    console.log('Loading user profile for exercises filter...');
    const profile = await loadUserProfile();
    setUserProfile(profile);
    console.log('Profile loaded:', profile?.selectedEquipment?.length ?? 0, 'equipment items');
  };

  const filteredExercises = useMemo(() => {
    let result = EXERCISES;

    if (selectedBodyArea !== 'all') {
      result = result.filter((e) => e.bodyArea === selectedBodyArea);
    }

    if (selectedEquipment.length > 0) {
      result = result.filter((e) =>
        selectedEquipment.some((eq) => e.equipment.includes(eq))
      );
    }

    if (useMyEquipmentOnly && userProfile?.selectedEquipment && userProfile.selectedEquipment.length > 0) {
      const userEquipment = new Set([...userProfile.selectedEquipment, 'bodyweight' as EquipmentId]);
      
      result = result.filter((exercise) => {
        return exercise.equipment.every((eq) => userEquipment.has(eq));
      });
    }

    return result;
  }, [selectedBodyArea, selectedEquipment, useMyEquipmentOnly, userProfile]);

  const toggleEquipment = (id: EquipmentId) => {
    setSelectedEquipment((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleExercisePress = (exerciseId: string) => {
    console.log('Navigating to exercise:', exerciseId);
    router.push({
      pathname: '/(tabs)/(exercises)/[exerciseId]' as any,
      params: { exerciseId },
    });
  };

  const hasUserEquipment = userProfile?.selectedEquipment && userProfile.selectedEquipment.length > 0;

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.background]}
      locations={[0, 0.2, 0.5]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Exercises</Text>
          <Text style={styles.subtitle}>
            {filteredExercises.length} exercises available
          </Text>
        </View>

        <View style={styles.filtersSection}>
          {hasUserEquipment && (
            <View style={styles.myEquipmentToggle}>
              <View style={styles.toggleContent}>
                <Filter size={18} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.toggleLabel}>Show only my equipment</Text>
              </View>
              <Switch
                value={useMyEquipmentOnly}
                onValueChange={setUseMyEquipmentOnly}
                trackColor={{ false: Colors.border, true: Colors.primaryDark }}
                thumbColor={useMyEquipmentOnly ? Colors.primary : Colors.white}
              />
            </View>
          )}

          <Text style={styles.filterLabel}>Body Area</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {BODY_AREA_FILTERS.map((filter) => (
              <FilterChip
                key={filter.key}
                label={filter.label}
                isSelected={selectedBodyArea === filter.key}
                onPress={() => setSelectedBodyArea(filter.key)}
                testID={`filter-${filter.key}`}
              />
            ))}
          </ScrollView>

          <Text style={[styles.filterLabel, { marginTop: 16 }]}>Equipment</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {EQUIPMENT.map((equipment) => (
              <EquipmentChip
                key={equipment.id}
                equipment={equipment}
                isSelected={selectedEquipment.includes(equipment.id)}
                onPress={() => toggleEquipment(equipment.id)}
              />
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.exercisesScroll}
          contentContainerStyle={[
            styles.exercisesContent,
            isTablet && styles.exercisesContentTablet,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {filteredExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Search size={48} color={Colors.textLight} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No exercises found</Text>
              <Text style={styles.emptySubtitle}>
                {useMyEquipmentOnly 
                  ? 'Try turning off the equipment filter or add more equipment in Profile'
                  : 'Try adjusting your filters'}
              </Text>
            </View>
          ) : (
            <View style={[styles.exercisesGrid, isTablet && styles.exercisesGridTablet]}>
              {filteredExercises.map((exercise, index) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  index={index}
                  onPress={() => handleExercisePress(exercise.id)}
                />
              ))}
            </View>
          )}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  filtersSection: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  myEquipmentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  exercisesScroll: {
    flex: 1,
  },
  exercisesContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  exercisesContentTablet: {
    paddingHorizontal: 40,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  exercisesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  exercisesGridTablet: {
    gap: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
