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
import { useTheme } from '@/src/context/ThemeContext';
import { UserProfile, DEFAULT_USER_PROFILE } from '@/src/types/profile';
import { loadUserProfile, saveUserProfile } from '@/src/storage/profileStorage';
import { EQUIPMENT } from '@/src/data/equipment';
import { EquipmentId } from '@/src/types/training';
import BirthdayPicker from '@/src/components/BirthdayPicker';
import MeasurementModal from '@/src/components/MeasurementModal';

const convertCmToFeetInches = (cm: number) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}`;
};

const convertFeetInchesToCm = (value: string): number | null => {
  const parts = value.split("'");
  if (parts.length !== 2) return null;
  const feet = parseFloat(parts[0]);
  const inches = parseFloat(parts[1]);
  if (isNaN(feet) || isNaN(inches)) return null;
  return (feet * 12 + inches) * 2.54;
};

const calculateAge = (birthday: string): number | null => {
  const normalized = birthday.trim();
  if (!normalized) return null;

  const birthDate = new Date(normalized);
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
  const { colors, customIconColor } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [birthdayInput, setBirthdayInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);
  const [heightModalVisible, setHeightModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);

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
      
      // Height
      if (stored.heightCm) {
         if (stored.heightUnit === 'ft') {
            setHeightInput(convertCmToFeetInches(stored.heightCm));
         } else {
            setHeightInput(stored.heightCm.toString());
         }
      }
      
      setWeightInput(stored.weight?.toString() ?? '');
    }
    setIsLoading(false);
  };

  const handleSaveProfile = useCallback(async () => {
    console.log('Saving profile...');
    setSaveStatus('saving');

    const birthDateInput = birthdayInput.trim();
    const age = calculateAge(birthDateInput);

    let heightCm: number | null = null;
    
    if (heightInput) {
      if (profile.heightUnit === 'ft') {
        heightCm = convertFeetInchesToCm(heightInput);
      } else {
        heightCm = parseFloat(heightInput);
      }
    }
    
    const weight = weightInput ? parseFloat(weightInput) : null;

    // Validate
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
    };

    await saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setSaveStatus('saved');
    
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  }, [birthdayInput, heightInput, weightInput, profile]);

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

  const styles = useMemo(() => createStyles(colors), [colors]);

  const calculatedAge = calculateAge(birthdayInput);
  const ageHelperText = birthdayInput
    ? calculatedAge !== null
      ? `Age: ${calculatedAge} years`
      : 'Invalid date'
    : 'Tap to set birthday';

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
            isSelected && customIconColor && { backgroundColor: customIconColor, borderColor: customIconColor }
          ]}>
            {isSelected && <Check size={14} color={colors.white} strokeWidth={3} />}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const InputRow = ({ icon: Icon, label, value, onPress, helperText }: any) => (
    <Pressable onPress={onPress} style={styles.inputCard}>
      <View style={[styles.inputIconContainer, customIconColor && { backgroundColor: customIconColor + '20' }]}>
        <Icon size={20} color={customIconColor || colors.primary} strokeWidth={2} />
      </View>
      <View style={styles.inputContent}>
        <Text style={styles.inputLabel}>{label}</Text>
        <Text style={[styles.textInput, !value && { color: colors.textLight }]}>
          {value || 'Not set'}
        </Text>
        {helperText && <Text style={styles.helperText}>{helperText}</Text>}
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.background]}
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

  // Helper to display height nicely
  const displayHeight = () => {
    if (!heightInput) return '';
    if (profile.heightUnit === 'ft') {
      const parts = heightInput.split("'");
      if (parts.length === 2) {
        return `${parts[0]} ft ${parts[1]} in`;
      }
      return heightInput; 
    }
    return `${heightInput} cm`;
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMiddle, colors.background]}
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
                      colors={customIconColor ? [customIconColor, customIconColor] : [colors.primary, colors.secondary]}
                      style={styles.avatar}
                    >
                      <User size={40} color={colors.white} strokeWidth={1.5} />
                    </LinearGradient>
                  </View>
                  <Text style={styles.profileName}>Fitness Enthusiast</Text>
                  <Text style={styles.profileEmail}>Welcome to HomeFit Gym</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Your Details</Text>
                  <View style={styles.inputsContainer}>
                    <InputRow
                      icon={Calendar}
                      label="Birthday"
                      value={birthdayInput}
                      onPress={() => setBirthdayModalVisible(true)}
                      helperText={ageHelperText}
                    />
                    
                    <InputRow
                      icon={Ruler}
                      label="Height"
                      value={displayHeight()} 
                      onPress={() => setHeightModalVisible(true)}
                    />
                    
                    <InputRow
                      icon={Scale}
                      label="Weight"
                      value={weightInput ? `${weightInput} ${profile.weightUnit}` : ''}
                      onPress={() => setWeightModalVisible(true)}
                    />
                  </View>

                  <Pressable onPress={handleSaveProfile} style={styles.saveButton}>
                    <LinearGradient
                      colors={customIconColor ? [customIconColor, customIconColor] : [colors.primary, colors.primaryDark]}
                      style={styles.saveButtonGradient}
                    >
                      {saveStatus === 'saving' ? (
                        <Text style={styles.saveButtonText}>Saving...</Text>
                      ) : saveStatus === 'saved' ? (
                        <>
                          <Check size={20} color={colors.white} strokeWidth={2.5} />
                          <Text style={styles.saveButtonText}>Profile Saved</Text>
                        </>
                      ) : (
                        <>
                          <Save size={20} color={colors.white} strokeWidth={2} />
                          <Text style={styles.saveButtonText}>Save Profile</Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Dumbbell size={18} color={colors.textSecondary} strokeWidth={2} />
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

        <BirthdayPicker
          visible={birthdayModalVisible}
          onClose={() => setBirthdayModalVisible(false)}
          onSave={setBirthdayInput}
          initialDate={birthdayInput}
        />

        <MeasurementModal
          visible={heightModalVisible}
          onClose={() => setHeightModalVisible(false)}
          onSave={(val, unit) => {
             setHeightInput(val);
             // Type casting unit to any because UserProfile might not strictly type 'ft' yet if I defined it strictly in types. 
             // Assuming UserProfile.heightUnit is string or includes 'ft'.
             setProfile(p => ({ ...p, heightUnit: unit as any })); 
          }}
          initialValue={heightInput}
          initialUnit={profile.heightUnit || 'cm'}
          title="Height"
          units={[
            { label: 'cm', value: 'cm' },
            { label: 'ft', value: 'ft' }
          ]}
        />

        <MeasurementModal
          visible={weightModalVisible}
          onClose={() => setWeightModalVisible(false)}
          onSave={(val, unit) => {
            setWeightInput(val);
            setProfile(p => ({ ...p, weightUnit: unit as any }));
          }}
          initialValue={weightInput}
          initialUnit={profile.weightUnit}
          title="Weight"
          units={[
            { label: 'kg', value: 'kg' },
            { label: 'lb', value: 'lb' },
          ]}
        />

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
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 24,
    shadowColor: colors.shadowColor,
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
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: colors.textSecondary,
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
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    marginTop: -8,
  },
  inputsContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    shadowColor: colors.shadowColor,
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
    borderBottomColor: colors.border,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  textInput: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  helperText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 6,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary,
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
    fontWeight: '700',
    color: colors.white,
  },
  equipmentContainer: {
    gap: 10,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  equipmentItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  equipmentContent: {
    flex: 1,
  },
  equipmentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  equipmentDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textLight,
    marginTop: 8,
  },
});
