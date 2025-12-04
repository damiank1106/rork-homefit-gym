import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Check,
  Scale,
  Ruler,
  Calendar,
  Dumbbell,
  Save,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { UserProfile, DEFAULT_USER_PROFILE, WeightUnit } from '@/src/types/profile';
import { loadUserProfile, saveUserProfile } from '@/src/storage/profileStorage';
import { EQUIPMENT } from '@/src/data/equipment';
import { EquipmentId } from '@/src/types/training';

export default function ProfileScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [ageInput, setAgeInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    const stored = await loadUserProfile();
    if (stored) {
      setProfile(stored);
      setAgeInput(stored.age?.toString() ?? '');
      setHeightInput(stored.heightCm?.toString() ?? '');
      setWeightInput(stored.weight?.toString() ?? '');
    }
    setIsLoading(false);
  };

  /**
   * SAVE PROFILE HANDLER
   * 
   * This is where the UserProfile is validated and saved to local storage.
   * The profile data is used throughout the app for:
   * - Filtering exercises by available equipment
   * - Calculating calories burned during workouts
   * 
   * FUTURE PHASE: This data will also be used when saving workout history
   * to calculate accurate calorie estimates for completed exercises.
   */
  const handleSaveProfile = useCallback(async () => {
    console.log('Saving profile...');
    setSaveStatus('saving');

    const age = ageInput ? parseInt(ageInput, 10) : null;
    const heightCm = heightInput ? parseFloat(heightInput) : null;
    const weight = weightInput ? parseFloat(weightInput) : null;

    if ((age !== null && (isNaN(age) || age < 0)) ||
        (heightCm !== null && (isNaN(heightCm) || heightCm < 0)) ||
        (weight !== null && (isNaN(weight) || weight < 0))) {
      console.log('Invalid input values');
      setSaveStatus('idle');
      return;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      age,
      heightCm,
      weight,
    };

    await saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setSaveStatus('saved');
    
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  }, [ageInput, heightInput, weightInput, profile]);

  const toggleEquipment = useCallback(async (equipmentId: EquipmentId) => {
    const newSelected = profile.selectedEquipment.includes(equipmentId)
      ? profile.selectedEquipment.filter(id => id !== equipmentId)
      : [...profile.selectedEquipment, equipmentId];

    const updatedProfile: UserProfile = {
      ...profile,
      selectedEquipment: newSelected,
    };

    setProfile(updatedProfile);
    await saveUserProfile(updatedProfile);
  }, [profile]);

  const setWeightUnit = useCallback(async (unit: WeightUnit) => {
    const updatedProfile: UserProfile = {
      ...profile,
      weightUnit: unit,
    };
    setProfile(updatedProfile);
    await saveUserProfile(updatedProfile);
  }, [profile]);

  const InputCard = ({
    icon: Icon,
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'numeric',
    suffix,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: 'numeric' | 'default';
    suffix?: string;
  }) => (
    <View style={styles.inputCard}>
      <View style={styles.inputIconContainer}>
        <Icon size={20} color={Colors.primary} strokeWidth={2} />
      </View>
      <View style={styles.inputContent}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.textLight}
            keyboardType={keyboardType}
          />
          {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
        </View>
      </View>
    </View>
  );

  const EquipmentItem = ({ equipment }: { equipment: typeof EQUIPMENT[0] }) => {
    const isSelected = profile.selectedEquipment.includes(equipment.id);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={() => {
            Animated.spring(scaleAnim, {
              toValue: 0.97,
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
          onPress={() => toggleEquipment(equipment.id)}
          style={[
            styles.equipmentItem,
            isSelected && styles.equipmentItemSelected,
          ]}
        >
          <View style={styles.equipmentContent}>
            <Text style={styles.equipmentLabel}>{equipment.label}</Text>
            <Text style={styles.equipmentDescription} numberOfLines={1}>
              {equipment.description}
            </Text>
          </View>
          <View style={[
            styles.checkCircle,
            isSelected && styles.checkCircleSelected,
          ]}>
            {isSelected && <Check size={14} color={Colors.white} strokeWidth={3} />}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.background]}
        locations={[0, 0.3, 0.6]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.background]}
      locations={[0, 0.3, 0.6]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>Customize your fitness journey</Text>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.avatar}
                >
                  <User size={40} color={Colors.white} strokeWidth={1.5} />
                </LinearGradient>
              </View>
              <Text style={styles.profileName}>Fitness Enthusiast</Text>
              <Text style={styles.profileEmail}>Welcome to HomeFit Gym</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Details</Text>
              <View style={styles.inputsContainer}>
                <InputCard
                  icon={Calendar}
                  label="Age"
                  value={ageInput}
                  onChangeText={setAgeInput}
                  placeholder="Enter age"
                  suffix="years"
                />
                <InputCard
                  icon={Ruler}
                  label="Height"
                  value={heightInput}
                  onChangeText={setHeightInput}
                  placeholder="Enter height"
                  suffix="cm"
                />
                <View style={styles.inputCard}>
                  <View style={styles.inputIconContainer}>
                    <Scale size={20} color={Colors.primary} strokeWidth={2} />
                  </View>
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Weight</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={[styles.textInput, { flex: 1 }]}
                        value={weightInput}
                        onChangeText={setWeightInput}
                        placeholder="Enter weight"
                        placeholderTextColor={Colors.textLight}
                        keyboardType="numeric"
                      />
                      <View style={styles.unitToggle}>
                        <Pressable
                          onPress={() => setWeightUnit('kg')}
                          style={[
                            styles.unitButton,
                            profile.weightUnit === 'kg' && styles.unitButtonActive,
                          ]}
                        >
                          <Text style={[
                            styles.unitText,
                            profile.weightUnit === 'kg' && styles.unitTextActive,
                          ]}>kg</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setWeightUnit('lb')}
                          style={[
                            styles.unitButton,
                            profile.weightUnit === 'lb' && styles.unitButtonActive,
                          ]}
                        >
                          <Text style={[
                            styles.unitText,
                            profile.weightUnit === 'lb' && styles.unitTextActive,
                          ]}>lb</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              <Pressable onPress={handleSaveProfile} style={styles.saveButton}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.saveButtonGradient}
                >
                  {saveStatus === 'saving' ? (
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  ) : saveStatus === 'saved' ? (
                    <>
                      <Check size={20} color={Colors.white} strokeWidth={2.5} />
                      <Text style={styles.saveButtonText}>Profile Saved</Text>
                    </>
                  ) : (
                    <>
                      <Save size={20} color={Colors.white} strokeWidth={2} />
                      <Text style={styles.saveButtonText}>Save Profile</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Dumbbell size={18} color={Colors.textSecondary} strokeWidth={2} />
                <Text style={styles.sectionTitle}>My Equipment</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Select the equipment you have at home to filter exercises
              </Text>
              <View style={styles.equipmentContainer}>
                {EQUIPMENT.map((equipment) => (
                  <EquipmentItem key={equipment.id} equipment={equipment} />
                ))}
              </View>
            </View>

            <Text style={styles.version}>HomeFit Gym v1.0.0</Text>
          </Animated.View>
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
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 24,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
    marginTop: -8,
  },
  inputsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    padding: 0,
    minWidth: 80,
  },
  inputSuffix: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    borderRadius: 8,
    padding: 2,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unitButtonActive: {
    backgroundColor: Colors.primary,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  unitTextActive: {
    color: Colors.white,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  equipmentContainer: {
    gap: 10,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  equipmentItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accent,
  },
  equipmentContent: {
    flex: 1,
  },
  equipmentLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  equipmentDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkCircleSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 8,
  },
});
