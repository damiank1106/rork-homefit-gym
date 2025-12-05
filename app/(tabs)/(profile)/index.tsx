import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
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

const convertKgToLb = (kg: number) => {
  return Math.round(kg * 2.20462 * 10) / 10;
};

const convertLbToKg = (lb: number) => {
  return Math.round((lb / 2.20462) * 10) / 10;
};

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
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const isCompactModal = width < 520;

  const [birthdayInput, setBirthdayInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [heightFeetInput, setHeightFeetInput] = useState('');
  const [heightInchesInput, setHeightInchesInput] = useState('');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [weightInput, setWeightInput] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [isBirthdayPickerVisible, setIsBirthdayPickerVisible] = useState(false);
  const [isHeightPickerVisible, setIsHeightPickerVisible] = useState(false);
  const [isWeightPickerVisible, setIsWeightPickerVisible] = useState(false);
  const [tempDay, setTempDay] = useState<number>(new Date().getDate());
  const [tempMonth, setTempMonth] = useState<number>(new Date().getMonth() + 1);
  const [tempYear, setTempYear] = useState<number>(new Date().getFullYear());
  const [tempHeightUnit, setTempHeightUnit] = useState<HeightUnit>('cm');
  const [tempHeightCm, setTempHeightCm] = useState<number>(170);
  const [tempHeightFeet, setTempHeightFeet] = useState<number>(5);
  const [tempHeightInches, setTempHeightInches] = useState<number>(8);
  const [tempWeightUnit, setTempWeightUnit] = useState<WeightUnit>('kg');
  const [tempWeightValue, setTempWeightValue] = useState<number>(70);
  const [tempHeightCmText, setTempHeightCmText] = useState('170');
  const [tempHeightFeetText, setTempHeightFeetText] = useState('5');
  const [tempHeightInchesText, setTempHeightInchesText] = useState('8');
  const [tempWeightText, setTempWeightText] = useState('70');

  const syncTempHeightCm = useCallback((value: number) => {
    setTempHeightCm(value);
    setTempHeightCmText(value.toString());
  }, []);

  const syncTempHeightFeet = useCallback((value: number) => {
    setTempHeightFeet(value);
    setTempHeightFeetText(value.toString());
  }, []);

  const syncTempHeightInches = useCallback((value: number) => {
    setTempHeightInches(value);
    setTempHeightInchesText(value.toString());
  }, []);

  const syncTempWeightValue = useCallback((value: number) => {
    setTempWeightValue(value);
    setTempWeightText(value.toString());
  }, []);

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
      if (stored.birthday) {
        const birthDate = new Date(stored.birthday);
        if (!isNaN(birthDate.getTime())) {
          setTempDay(birthDate.getDate());
          setTempMonth(birthDate.getMonth() + 1);
          setTempYear(birthDate.getFullYear());
        }
      }
      const resolvedUnit = stored.heightUnit ?? 'cm';
      setHeightUnit(resolvedUnit);

      setHeightInput(stored.heightCm?.toString() ?? '');
      if (stored.heightCm) {
        const { feet, inches } = convertCmToFeetInches(stored.heightCm);
        setHeightFeetInput(feet.toString());
        setHeightInchesInput(inches.toString());
      }
      setWeightUnit(stored.weightUnit ?? 'kg');
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

    const birthDateInput = birthdayInput.trim();
    const age = calculateAge(birthDateInput);

    let heightCm: number | null = null;
    if (heightUnit === 'cm') {
      heightCm = heightInput ? parseFloat(heightInput) : null;
    } else {
      const feet = heightFeetInput ? parseInt(heightFeetInput, 10) : 0;
      const inches = heightInchesInput ? parseFloat(heightInchesInput) : 0;
      if (heightFeetInput || heightInchesInput) {
        heightCm = convertFeetInchesToCm(feet, inches);
      }
    }

    const weight = weightInput ? parseFloat(weightInput) : null;

    const isInvalid =
      (birthDateInput && age === null) ||
      (heightCm !== null && (isNaN(heightCm) || heightCm < 0)) ||
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
      heightCm,
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
  }, [birthdayInput, heightFeetInput, heightInchesInput, heightInput, heightUnit, weightInput, weightUnit, profile]);

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

  const calculatedAge = calculateAge(birthdayInput);
  const ageHelperText = birthdayInput
    ? calculatedAge !== null
      ? `Age: ${calculatedAge} years`
      : 'Enter a valid date (YYYY-MM-DD)'
    : 'Add your birth date to calculate age';

  const pickerColumnsStyle = useMemo(
    () => [styles.pickerColumns, isCompactModal && styles.pickerColumnsStacked],
    [isCompactModal],
  );

  const pickerColumnStyle = useMemo(
    () => [styles.pickerColumn, isCompactModal && styles.pickerColumnFullWidth],
    [isCompactModal],
  );

  const heightDisplay = useMemo(() => {
    if (heightUnit === 'cm') {
      return heightInput ? `${heightInput} cm` : '';
    }

    if (heightFeetInput || heightInchesInput) {
      return `${heightFeetInput || '0'} ft ${heightInchesInput || '0'} in`;
    }

    return '';
  }, [heightFeetInput, heightInchesInput, heightInput, heightUnit]);

  const weightDisplay = useMemo(() => {
    return weightInput ? `${weightInput} ${weightUnit}` : '';
  }, [weightInput, weightUnit]);

  const daysInMonth = useMemo(() => {
    return new Date(tempYear, tempMonth, 0).getDate();
  }, [tempMonth, tempYear]);

  useEffect(() => {
    if (tempDay > daysInMonth) {
      setTempDay(daysInMonth);
    }
  }, [daysInMonth, tempDay]);

  const openBirthdayPicker = useCallback(() => {
    const existingDate = birthdayInput ? new Date(birthdayInput) : null;
    const validDate = existingDate && !isNaN(existingDate.getTime()) ? existingDate : new Date();

    setTempDay(validDate.getDate());
    setTempMonth(validDate.getMonth() + 1);
    setTempYear(validDate.getFullYear());
    setIsBirthdayPickerVisible(true);
  }, [birthdayInput]);

  const saveBirthday = useCallback(() => {
    const formatted = `${tempYear}-${String(tempMonth).padStart(2, '0')}-${String(tempDay).padStart(2, '0')}`;
    setBirthdayInput(formatted);
    setIsBirthdayPickerVisible(false);
  }, [tempDay, tempMonth, tempYear]);

  const openHeightPicker = useCallback(() => {
    const unit = heightUnit ?? 'cm';
    setTempHeightUnit(unit);

    if (unit === 'cm') {
      const cmValue = heightInput ? parseFloat(heightInput) : profile.heightCm ?? 170;
      const safeCm = !isNaN(cmValue) && cmValue > 0 ? cmValue : 170;
      syncTempHeightCm(safeCm);
      const { feet, inches } = convertCmToFeetInches(safeCm);
      syncTempHeightFeet(feet);
      syncTempHeightInches(inches);
    } else {
      const feet = heightFeetInput ? parseInt(heightFeetInput, 10) : null;
      const inches = heightInchesInput ? parseFloat(heightInchesInput) : null;

      if (feet !== null && inches !== null && !isNaN(feet) && !isNaN(inches)) {
        syncTempHeightFeet(feet);
        syncTempHeightInches(inches);
        syncTempHeightCm(convertFeetInchesToCm(feet, inches));
      } else if (profile.heightCm) {
        const { feet: savedFeet, inches: savedInches } = convertCmToFeetInches(profile.heightCm);
        syncTempHeightFeet(savedFeet);
        syncTempHeightInches(savedInches);
        syncTempHeightCm(profile.heightCm);
      }
    }

    setIsHeightPickerVisible(true);
  }, [heightFeetInput, heightInchesInput, heightInput, heightUnit, profile.heightCm, syncTempHeightCm, syncTempHeightFeet, syncTempHeightInches]);

  const handleTempHeightUnitChange = useCallback((unit: HeightUnit) => {
    if (unit === tempHeightUnit) return;

    if (unit === 'cm') {
      const cmValue = convertFeetInchesToCm(tempHeightFeet, tempHeightInches);
      syncTempHeightCm(cmValue);
    } else {
      const { feet, inches } = convertCmToFeetInches(tempHeightCm);
      syncTempHeightFeet(feet);
      syncTempHeightInches(inches);
    }

    setTempHeightUnit(unit);
  }, [syncTempHeightCm, syncTempHeightFeet, syncTempHeightInches, tempHeightCm, tempHeightFeet, tempHeightInches, tempHeightUnit]);

  const handleHeightCmInputChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setTempHeightCmText(sanitized);
    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed)) {
      syncTempHeightCm(Math.max(0, Math.min(260, parsed)));
    }
  }, [syncTempHeightCm]);

  const handleHeightFeetInputChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setTempHeightFeetText(sanitized);
    const parsed = parseInt(sanitized, 10);
    if (!isNaN(parsed)) {
      syncTempHeightFeet(Math.max(0, Math.min(8, parsed)));
    }
  }, [syncTempHeightFeet]);

  const handleHeightInchesInputChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setTempHeightInchesText(sanitized);
    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed)) {
      syncTempHeightInches(Math.max(0, Math.min(11, parsed)));
    }
  }, [syncTempHeightInches]);

  const handleWeightInputChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setTempWeightText(sanitized);
    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed)) {
      syncTempWeightValue(Math.max(0, parsed));
    }
  }, [syncTempWeightValue]);

  const saveHeightSelection = useCallback(() => {
    if (tempHeightUnit === 'cm') {
      const roundedCm = Math.round(tempHeightCm * 10) / 10;
      setHeightInput(roundedCm.toString());
      const { feet, inches } = convertCmToFeetInches(roundedCm);
      setHeightFeetInput(feet.toString());
      setHeightInchesInput(inches.toString());
    } else {
      const inchesValue = Math.min(11, Math.max(0, Math.round(tempHeightInches)));
      const cmValue = convertFeetInchesToCm(tempHeightFeet, inchesValue);
      setHeightFeetInput(tempHeightFeet.toString());
      setHeightInchesInput(inchesValue.toString());
      setHeightInput(cmValue.toString());
    }

    setHeightUnit(tempHeightUnit);
    setIsHeightPickerVisible(false);
  }, [tempHeightCm, tempHeightFeet, tempHeightInches, tempHeightUnit]);

  const openWeightPicker = useCallback(() => {
    const unit = weightUnit ?? 'kg';
    setTempWeightUnit(unit);

    const parsedWeight = weightInput ? parseFloat(weightInput) : profile.weight ?? null;
    const defaultWeight = unit === 'kg' ? 70 : 155;
    const safeWeight = parsedWeight && !isNaN(parsedWeight) ? parsedWeight : defaultWeight;

    syncTempWeightValue(safeWeight);
    setIsWeightPickerVisible(true);
  }, [profile.weight, syncTempWeightValue, weightInput, weightUnit]);

  const handleTempWeightUnitChange = useCallback((unit: WeightUnit) => {
    if (unit === tempWeightUnit) return;

    if (unit === 'kg') {
      syncTempWeightValue(convertLbToKg(tempWeightValue));
    } else {
      syncTempWeightValue(convertKgToLb(tempWeightValue));
    }

    setTempWeightUnit(unit);
  }, [syncTempWeightValue, tempWeightUnit, tempWeightValue]);

  const saveWeightSelection = useCallback(() => {
    const roundedWeight = Math.round(tempWeightValue * 10) / 10;
    setWeightUnit(tempWeightUnit);
    setWeightInput(roundedWeight.toString());
    setIsWeightPickerVisible(false);
  }, [tempWeightUnit, tempWeightValue]);

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
      <Modal
        visible={isBirthdayPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBirthdayPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalAvoidingView}
          >
            <View style={[styles.modalContent, isCompactModal && styles.modalContentCompact]}>
              <Text style={styles.modalTitle}>Select your birthday</Text>
              <View style={pickerColumnsStyle}>
                <View style={pickerColumnStyle}>
                  <Text style={styles.pickerLabel}>Day</Text>
                  <ScrollView
                    style={styles.pickerScrollable}
                    contentContainerStyle={styles.pickerList}
                    showsVerticalScrollIndicator={false}
                  >
                    {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(day => (
                      <Pressable
                        key={day}
                        onPress={() => setTempDay(day)}
                        style={[styles.pickerOption, tempDay === day && styles.pickerOptionSelected]}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            isSmallScreen && styles.pickerOptionTextSmall,
                            tempDay === day && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {day}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                <View style={pickerColumnStyle}>
                  <Text style={styles.pickerLabel}>Month</Text>
                  <ScrollView
                    style={styles.pickerScrollable}
                    contentContainerStyle={styles.pickerList}
                    showsVerticalScrollIndicator={false}
                  >
                    {[
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ].map((monthName, index) => {
                      const monthNumber = index + 1;
                      return (
                        <Pressable
                          key={monthName}
                          onPress={() => setTempMonth(monthNumber)}
                          style={[
                            styles.pickerOption,
                            tempMonth === monthNumber && styles.pickerOptionSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              isSmallScreen && styles.pickerOptionTextSmall,
                              tempMonth === monthNumber && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {monthName}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={pickerColumnStyle}>
                  <Text style={styles.pickerLabel}>Year</Text>
                  <ScrollView
                    style={styles.pickerScrollable}
                    contentContainerStyle={styles.pickerList}
                    showsVerticalScrollIndicator={false}
                  >
                    {Array.from({ length: 100 }, (_, index) => new Date().getFullYear() - index).map(year => (
                      <Pressable
                        key={year}
                        onPress={() => setTempYear(year)}
                        style={[styles.pickerOption, tempYear === year && styles.pickerOptionSelected]}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            isSmallScreen && styles.pickerOptionTextSmall,
                            tempYear === year && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {year}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setIsBirthdayPickerVisible(false)}
                >
                  <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={saveBirthday}>
                  <Text style={styles.modalButtonTextPrimary}>Save</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <Modal
        visible={isHeightPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsHeightPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalAvoidingView}
          >
            <View style={[styles.modalContent, isCompactModal && styles.modalContentCompact]}>
              <Text style={styles.modalTitle}>Select your height</Text>
              <View style={styles.unitToggle}>
                <Pressable
                  onPress={() => handleTempHeightUnitChange('cm')}
                style={[styles.unitButton, tempHeightUnit === 'cm' && styles.unitButtonActive]}
              >
                <Text style={[styles.unitText, tempHeightUnit === 'cm' && styles.unitTextActive]}>cm</Text>
              </Pressable>
              <Pressable
                onPress={() => handleTempHeightUnitChange('imperial')}
                style={[styles.unitButton, tempHeightUnit === 'imperial' && styles.unitButtonActive]}
              >
                <Text style={[styles.unitText, tempHeightUnit === 'imperial' && styles.unitTextActive]}>ft / in</Text>
              </Pressable>
            </View>

            {tempHeightUnit === 'cm' ? (
              <View style={pickerColumnsStyle}>
                <View style={pickerColumnStyle}>
                  <Text style={styles.pickerLabel}>Centimeters</Text>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="numeric"
                    inputMode="numeric"
                    value={tempHeightCmText}
                    onChangeText={handleHeightCmInputChange}
                    placeholder="Enter height"
                  />
                  <ScrollView
                    style={styles.pickerScrollable}
                    contentContainerStyle={styles.pickerList}
                    showsVerticalScrollIndicator={false}
                  >
                    {Array.from({ length: 101 }, (_, index) => 120 + index).map(cm => (
                      <Pressable
                        key={cm}
                        onPress={() => syncTempHeightCm(cm)}
                        style={[styles.pickerOption, tempHeightCm === cm && styles.pickerOptionSelected]}
                      >
                        <Text
                          style={[styles.pickerOptionText, tempHeightCm === cm && styles.pickerOptionTextSelected]}
                        >
                          {cm} cm
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ) : (
              <View style={pickerColumnsStyle}>
                <View style={pickerColumnStyle}>
                  <Text style={styles.pickerLabel}>Feet</Text>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="numeric"
                    inputMode="numeric"
                    value={tempHeightFeetText}
                    onChangeText={handleHeightFeetInputChange}
                    placeholder="Enter feet"
                  />
                  <ScrollView
                    style={styles.pickerScrollable}
                    contentContainerStyle={styles.pickerList}
                    showsVerticalScrollIndicator={false}
                  >
                    {Array.from({ length: 5 }, (_, index) => 4 + index).map(feet => (
                      <Pressable
                        key={feet}
                        onPress={() => syncTempHeightFeet(feet)}
                        style={[styles.pickerOption, tempHeightFeet === feet && styles.pickerOptionSelected]}
                      >
                        <Text
                          style={[styles.pickerOptionText, tempHeightFeet === feet && styles.pickerOptionTextSelected]}
                        >
                          {feet} ft
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
                <View style={pickerColumnStyle}>
                  <Text style={styles.pickerLabel}>Inches</Text>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="numeric"
                    inputMode="numeric"
                    value={tempHeightInchesText}
                    onChangeText={handleHeightInchesInputChange}
                    placeholder="Enter inches"
                  />
                  <ScrollView
                    style={styles.pickerScrollable}
                    contentContainerStyle={styles.pickerList}
                    showsVerticalScrollIndicator={false}
                  >
                    {Array.from({ length: 12 }, (_, index) => index).map(inches => (
                      <Pressable
                        key={inches}
                        onPress={() => syncTempHeightInches(inches)}
                        style={[styles.pickerOption, tempHeightInches === inches && styles.pickerOptionSelected]}
                      >
                        <Text
                          style={[styles.pickerOptionText, tempHeightInches === inches && styles.pickerOptionTextSelected]}
                        >
                          {inches} in
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setIsHeightPickerVisible(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={saveHeightSelection}>
                <Text style={styles.modalButtonTextPrimary}>Save</Text>
              </Pressable>
            </View>
          </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <Modal
        visible={isWeightPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsWeightPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalAvoidingView}
          >
            <View style={[styles.modalContent, isCompactModal && styles.modalContentCompact]}>
              <Text style={styles.modalTitle}>Select your weight</Text>
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

            <View style={pickerColumnsStyle}>
              <View style={pickerColumnStyle}>
                <Text style={styles.pickerLabel}>Weight</Text>
                <TextInput
                  style={styles.numberInput}
                  keyboardType="numeric"
                  inputMode="numeric"
                  value={tempWeightText}
                  onChangeText={handleWeightInputChange}
                  placeholder={`Enter weight in ${tempWeightUnit}`}
                />
                <ScrollView
                  style={styles.pickerScrollable}
                  contentContainerStyle={styles.pickerList}
                  showsVerticalScrollIndicator={false}
                >
                  {(tempWeightUnit === 'kg'
                    ? Array.from({ length: 171 }, (_, index) => 30 + index)
                    : Array.from({ length: 331 }, (_, index) => 70 + index)
                  ).map(weightValue => (
                    <Pressable
                      key={weightValue}
                      onPress={() => syncTempWeightValue(weightValue)}
                      style={[styles.pickerOption, tempWeightValue === weightValue && styles.pickerOptionSelected]}
                    >
                      <Text
                        style={[styles.pickerOptionText, tempWeightValue === weightValue && styles.pickerOptionTextSelected]}
                      >
                        {weightValue} {tempWeightUnit}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setIsWeightPickerVisible(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={saveWeightSelection}>
                <Text style={styles.modalButtonTextPrimary}>Save</Text>
              </Pressable>
            </View>
          </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
                    <View style={styles.inputCard}>
                      <View style={styles.inputIconContainer}>
                        <Calendar size={20} color={Colors.primary} strokeWidth={2} />
                      </View>
                      <View style={styles.inputContent}>
                        <Text style={styles.inputLabel}>Birthday</Text>
                        <Pressable
                          style={styles.dateSelector}
                          onPress={openBirthdayPicker}
                          accessibilityRole="button"
                          accessibilityLabel="Select your birthday"
                        >
                          <Text style={[styles.dateText, !birthdayInput && styles.datePlaceholder]}>
                            {birthdayInput || 'Select your birth date'}
                          </Text>
                        </Pressable>
                        <Text style={styles.helperText}>{ageHelperText}</Text>
                      </View>
                    </View>
                    <View style={styles.inputCard}>
                      <View style={styles.inputIconContainer}>
                        <Ruler size={20} color={Colors.primary} strokeWidth={2} />
                      </View>
                      <View style={styles.inputContent}>
                        <Text style={styles.inputLabel}>Height</Text>
                        <Pressable
                          style={styles.dateSelector}
                          onPress={openHeightPicker}
                          accessibilityRole="button"
                          accessibilityLabel="Select your height"
                        >
                          <Text style={[styles.dateText, !heightDisplay && styles.datePlaceholder]}>
                            {heightDisplay || 'Select your height'}
                          </Text>
                        </Pressable>
                        <Text style={styles.helperText}>Choose cm or ft/inches</Text>
                      </View>
                    </View>
                    <View style={styles.inputCard}>
                      <View style={styles.inputIconContainer}>
                        <Scale size={20} color={Colors.primary} strokeWidth={2} />
                      </View>
                      <View style={styles.inputContent}>
                        <Text style={styles.inputLabel}>Weight</Text>
                        <Pressable
                          style={styles.dateSelector}
                          onPress={openWeightPicker}
                          accessibilityRole="button"
                          accessibilityLabel="Select your weight"
                        >
                          <Text style={[styles.dateText, !weightDisplay && styles.datePlaceholder]}>
                            {weightDisplay || 'Select your weight'}
                          </Text>
                        </Pressable>
                        <Text style={styles.helperText}>Choose kg or lbs</Text>
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
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  helperText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 6,
  },
  dateSelector: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.accent,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  datePlaceholder: {
    color: Colors.textLight,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvoidingView: {
    width: '100%',
    maxHeight: '90%',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    width: '100%',
    maxWidth: 640,
    maxHeight: '100%',
  },
  modalContentCompact: {
    maxWidth: '100%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  pickerColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerColumnsStacked: {
    flexDirection: 'column',
  },
  pickerColumn: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    padding: 10,
    minHeight: 150,
    maxHeight: 280,
  },
  pickerScrollable: {
    flex: 1,
  },
  pickerColumnFullWidth: {
    width: '100%',
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  numberInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  pickerList: {
    gap: 6,
    paddingBottom: 6,
  },
  pickerOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.white,
  },
  pickerOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pickerOptionTextSmall: {
    fontSize: 12,
  },
  pickerOptionTextSelected: {
    color: Colors.text,
    fontWeight: '700' as const,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalButtonSecondary: {
    backgroundColor: Colors.accent,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonTextSecondary: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  modalButtonTextPrimary: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 8,
  },
});
