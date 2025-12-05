import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
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
import { UserProfile, DEFAULT_USER_PROFILE, WeightUnit, HeightUnit } from '@/src/types/profile';
import { loadUserProfile, saveUserProfile } from '@/src/storage/profileStorage';
import { EQUIPMENT } from '@/src/data/equipment';
import { EquipmentId } from '@/src/types/training';

const convertCmToFeetInches = (cm: number) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = parseFloat((totalInches % 12).toFixed(1));
  return { feet, inches };
};

const convertFeetInchesToCm = (feet: number, inches: number) => {
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
};

const convertKgToLb = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
const convertLbToKg = (lb: number) => Math.round((lb / 2.20462) * 10) / 10;

const HEIGHT_CM_OPTIONS = Array.from({ length: 131 }, (_, i) => 120 + i);
const HEIGHT_FEET_OPTIONS = [4, 5, 6, 7];
const HEIGHT_INCH_OPTIONS = Array.from({ length: 12 }, (_, i) => i);
const WEIGHT_KG_OPTIONS = Array.from({ length: 171 }, (_, i) => 30 + i);

const calculateAge = (birthday: string): number | null => {
  if (!birthday) return null;

  const birthDate = new Date(birthday);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

export default function ProfileScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [birthdayInput, setBirthdayInput] = useState('');
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [weightValue, setWeightValue] = useState<number | null>(null);
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>('kg');
  const [heightModalVisible, setHeightModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);

  const [tempHeightUnit, setTempHeightUnit] = useState<HeightUnit>('cm');
  const [tempHeightCm, setTempHeightCm] = useState<number | null>(null);
  const [tempHeightFeet, setTempHeightFeet] = useState<number>(5);
  const [tempHeightInches, setTempHeightInches] = useState<number>(6);

  const [tempWeightUnit, setTempWeightUnit] = useState<WeightUnit>('kg');
  const [tempWeightValue, setTempWeightValue] = useState<number | null>(null);

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
      const normalizedProfile: UserProfile = {
        ...stored,
        birthday: stored.birthday ?? null,
        age: stored.birthday
          ? calculateAge(stored.birthday) ?? stored.age ?? null
          : stored.age ?? null,
      };
      setProfile(normalizedProfile);
      setBirthdayInput(stored.birthday ?? '');
      const resolvedUnit = stored.heightUnit ?? 'cm';
      setHeightUnit(resolvedUnit);
      setHeightCm(stored.heightCm ?? null);
      const resolvedWeightUnit = stored.weightUnit ?? 'kg';
      setWeightUnitState(resolvedWeightUnit);
      setWeightValue(stored.weight ?? null);
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

    const birthDateInput = birthdayInput.trim();
    const age = calculateAge(birthDateInput);

    const heightCmValue = heightCm;
    const weight = weightValue;

    const isInvalid =
      (birthDateInput && age === null) ||
      (heightCmValue !== null && (isNaN(heightCmValue) || heightCmValue < 0)) ||
      (weight !== null && (isNaN(weight) || weight < 0));

    if (isInvalid) {
      console.log('Invalid input values');
      setSaveStatus('idle');
      return;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      birthday: birthDateInput || null,
      age,
      heightCm: heightCmValue,
      weight,
      heightUnit,
      weightUnit,
    };

    await saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setSaveStatus('saved');
    
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  }, [birthdayInput, heightCm, heightUnit, profile, weightUnit, weightValue]);

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

  const handleHeightUnitChange = useCallback((unit: HeightUnit) => {
    if (unit === tempHeightUnit) return;

    if (unit === 'imperial' && tempHeightCm !== null) {
      const { feet, inches } = convertCmToFeetInches(tempHeightCm);
      setTempHeightFeet(feet);
      setTempHeightInches(inches);
    }

    if (unit === 'cm' && tempHeightCm === null) {
      setTempHeightCm(convertFeetInchesToCm(tempHeightFeet, tempHeightInches));
    }

    setTempHeightUnit(unit);
  }, [tempHeightCm, tempHeightFeet, tempHeightInches, tempHeightUnit]);

  const handleTempWeightUnitChange = (unit: WeightUnit) => {
    if (unit === tempWeightUnit) return;

    if (tempWeightValue !== null) {
      const converted = unit === 'kg' ? convertLbToKg(tempWeightValue) : convertKgToLb(tempWeightValue);
      setTempWeightValue(converted);
    }

    setTempWeightUnit(unit);
  };

  const selectHeightCm = (value: number) => {
    setTempHeightCm(value);
    const { feet, inches } = convertCmToFeetInches(value);
    setTempHeightFeet(feet);
    setTempHeightInches(inches);
  };

  const selectHeightFeet = (value: number) => {
    setTempHeightFeet(value);
    setTempHeightCm(convertFeetInchesToCm(value, tempHeightInches));
  };

  const selectHeightInches = (value: number) => {
    setTempHeightInches(value);
    setTempHeightCm(convertFeetInchesToCm(tempHeightFeet, value));
  };

  const selectWeightValue = (value: number) => {
    setTempWeightValue(value);
  };

  const formatHeightDisplay = () => {
    if (!heightCm) return 'Add height';
    if (heightUnit === 'cm') return `${heightCm} cm`;

    const { feet, inches } = convertCmToFeetInches(heightCm);
    const inchDisplay = inches % 1 === 0 ? inches.toString() : inches.toFixed(1);
    return `${feet} ft ${inchDisplay} in`;
  };

  const formatWeightDisplay = () => {
    if (!weightValue) return 'Add weight';
    const displayValue = weightValue % 1 === 0 ? weightValue.toString() : weightValue.toFixed(1);
    return `${displayValue} ${weightUnit}`;
  };

  const calculatedAge = calculateAge(birthdayInput);
  const ageHelperText = birthdayInput
    ? calculatedAge !== null
      ? `Age: ${calculatedAge} years`
      : 'Enter a valid date (YYYY-MM-DD)'
    : 'Add your birth date to calculate age';

  const openHeightModal = () => {
    setTempHeightUnit(heightUnit);
    setTempHeightCm(heightCm);
    if (heightCm) {
      const { feet, inches } = convertCmToFeetInches(heightCm);
      setTempHeightFeet(feet);
      setTempHeightInches(inches);
    }
    setHeightModalVisible(true);
  };

  const openWeightModal = () => {
    setTempWeightUnit(weightUnit);
    setTempWeightValue(weightValue);
    setWeightModalVisible(true);
  };

  const openBirthdayModal = () => {
    setBirthdayModalVisible(true);
  };

  const confirmHeightSelection = () => {
    setHeightUnit(tempHeightUnit);
    setHeightCm(tempHeightCm);
    setHeightModalVisible(false);
  };

  const confirmWeightSelection = () => {
    setWeightUnitState(tempWeightUnit);
    setWeightValue(tempWeightValue);
    setWeightModalVisible(false);
  };

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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
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
                    <Pressable style={styles.inputCard} onPress={openBirthdayModal}>
                      <View style={styles.inputIconContainer}>
                        <Calendar size={20} color={Colors.primary} strokeWidth={2} />
                      </View>
                      <View style={styles.inputContent}>
                        <Text style={styles.inputLabel}>Birthday</Text>
                        <Text style={styles.valueText}>
                          {birthdayInput || 'Tap to set birthday'}
                        </Text>
                        <Text style={styles.helperText}>{ageHelperText}</Text>
                      </View>
                    </Pressable>

                    <Pressable style={styles.inputCard} onPress={openHeightModal}>
                      <View style={styles.inputIconContainer}>
                        <Ruler size={20} color={Colors.primary} strokeWidth={2} />
                      </View>
                      <View style={styles.inputContent}>
                        <View style={styles.inputHeaderRow}>
                          <Text style={styles.inputLabel}>Height</Text>
                          <Text style={styles.unitBadge}>{heightUnit === 'cm' ? 'cm' : 'ft / in'}</Text>
                        </View>
                        <Text style={styles.valueText}>{formatHeightDisplay()}</Text>
                        <Text style={styles.helperText}>Opens modal picker</Text>
                      </View>
                    </Pressable>

                    <Pressable style={styles.inputCard} onPress={openWeightModal}>
                      <View style={styles.inputIconContainer}>
                        <Scale size={20} color={Colors.primary} strokeWidth={2} />
                      </View>
                      <View style={styles.inputContent}>
                        <View style={styles.inputHeaderRow}>
                          <Text style={styles.inputLabel}>Weight</Text>
                          <Text style={styles.unitBadge}>{weightUnit}</Text>
                        </View>
                        <Text style={styles.valueText}>{formatWeightDisplay()}</Text>
                        <Text style={styles.helperText}>Tap to convert kg / lb</Text>
                      </View>
                    </Pressable>
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

            <Modal visible={birthdayModalVisible} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Select Birthday</Text>
                  <Text style={styles.modalSubtitle}>Enter your birth date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={birthdayInput}
                    onChangeText={setBirthdayInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textLight}
                  />
                  <Text style={styles.modalHelper}>{ageHelperText}</Text>
                  <View style={styles.modalActions}>
                    <Pressable onPress={() => setBirthdayModalVisible(false)} style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable onPress={() => setBirthdayModalVisible(false)} style={styles.primaryButton}>
                      <Text style={styles.primaryButtonText}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal visible={heightModalVisible} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Select Height</Text>
                  <Text style={styles.modalSubtitle}>Switch units and pick your height</Text>
                  <View style={styles.unitToggle}>
                    <Pressable
                      onPress={() => handleHeightUnitChange('cm')}
                      style={[styles.unitButton, tempHeightUnit === 'cm' && styles.unitButtonActive]}
                    >
                      <Text style={[styles.unitText, tempHeightUnit === 'cm' && styles.unitTextActive]}>cm</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleHeightUnitChange('imperial')}
                      style={[styles.unitButton, tempHeightUnit === 'imperial' && styles.unitButtonActive]}
                    >
                      <Text
                        style={[styles.unitText, tempHeightUnit === 'imperial' && styles.unitTextActive]}
                      >
                        ft / in
                      </Text>
                    </Pressable>
                  </View>

                  {tempHeightUnit === 'cm' ? (
                    <ScrollView contentContainerStyle={styles.pickerGrid}>
                      {HEIGHT_CM_OPTIONS.map((option) => (
                        <Pressable
                          key={`cm-${option}`}
                          style={[styles.pickerOption, tempHeightCm === option && styles.pickerOptionActive]}
                          onPress={() => selectHeightCm(option)}
                        >
                          <Text
                            style={[styles.pickerValue, tempHeightCm === option && styles.pickerValueActive]}
                          >
                            {option} cm
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.imperialPickerRow}>
                      <View style={styles.imperialColumn}>
                        <Text style={styles.modalSubtitle}>Feet</Text>
                        <ScrollView>
                          {HEIGHT_FEET_OPTIONS.map((option) => (
                            <Pressable
                              key={`ft-${option}`}
                              style={[styles.pickerOption, tempHeightFeet === option && styles.pickerOptionActive]}
                              onPress={() => selectHeightFeet(option)}
                            >
                              <Text
                                style={[styles.pickerValue, tempHeightFeet === option && styles.pickerValueActive]}
                              >
                                {option}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                      <View style={styles.imperialColumn}>
                        <Text style={styles.modalSubtitle}>Inches</Text>
                        <ScrollView>
                          {HEIGHT_INCH_OPTIONS.map((option) => (
                            <Pressable
                              key={`in-${option}`}
                              style={[styles.pickerOption, tempHeightInches === option && styles.pickerOptionActive]}
                              onPress={() => selectHeightInches(option)}
                            >
                              <Text
                                style={[styles.pickerValue, tempHeightInches === option && styles.pickerValueActive]}
                              >
                                {option}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  )}

                  <View style={styles.modalActions}>
                    <Pressable onPress={() => setHeightModalVisible(false)} style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable onPress={confirmHeightSelection} style={styles.primaryButton}>
                      <Text style={styles.primaryButtonText}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal visible={weightModalVisible} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Select Weight</Text>
                  <Text style={styles.modalSubtitle}>Choose unit and pick a weight value</Text>
                  <View style={styles.unitToggle}>
                    <Pressable
                      onPress={() => handleTempWeightUnitChange('kg')}
                      style={[styles.unitButton, tempWeightUnit === 'kg' && styles.unitButtonActive]}
                    >
                      <Text style={[styles.unitText, tempWeightUnit === 'kg' && styles.unitTextActive]}>kg</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleTempWeightUnitChange('lb')}
                      style={[styles.unitButton, tempWeightUnit === 'lb' && styles.unitButtonActive]}
                    >
                      <Text style={[styles.unitText, tempWeightUnit === 'lb' && styles.unitTextActive]}>lb</Text>
                    </Pressable>
                  </View>

                  <ScrollView contentContainerStyle={styles.pickerGrid}>
                    {(tempWeightUnit === 'kg'
                      ? WEIGHT_KG_OPTIONS
                      : WEIGHT_KG_OPTIONS.map((kg) => parseFloat(convertKgToLb(kg).toFixed(1)))
                    ).map((option) => (
                      <Pressable
                        key={`${tempWeightUnit}-${option}`}
                        style={[styles.pickerOption, tempWeightValue === option && styles.pickerOptionActive]}
                        onPress={() => selectWeightValue(option)}
                      >
                        <Text
                          style={[styles.pickerValue, tempWeightValue === option && styles.pickerValueActive]}
                        >
                          {option} {tempWeightUnit}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <View style={styles.modalActions}>
                    <Pressable onPress={() => setWeightModalVisible(false)} style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable onPress={confirmWeightSelection} style={styles.primaryButton}>
                      <Text style={styles.primaryButtonText}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </TouchableWithoutFeedback>

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
  valueText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  unitBadge: {
    backgroundColor: Colors.accent,
    color: Colors.textSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  modalHelper: {
    fontSize: 12,
    color: Colors.textLight,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '700' as const,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
  },
  pickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: '30%',
    alignItems: 'center',
  },
  pickerOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accent,
  },
  pickerValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  pickerValueActive: {
    color: Colors.primary,
  },
  imperialPickerRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  imperialColumn: {
    flex: 1,
    gap: 6,
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
  heightImperialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heightSubField: {
    flex: 1,
  },
  heightSubLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
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
