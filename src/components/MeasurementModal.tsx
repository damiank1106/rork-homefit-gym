import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { X, Check } from 'lucide-react-native';

interface MeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (value: string, unit: string) => void;
  initialValue: string;
  initialUnit: string;
  title: string;
  units: { label: string; value: string }[];
}

export default function MeasurementModal({
  visible,
  onClose,
  onSave,
  initialValue,
  initialUnit,
  title,
  units,
}: MeasurementModalProps) {
  const { colors } = useTheme();
  const [unit, setUnit] = useState(initialUnit);
  
  // State for single input (cm, kg, lb)
  const [value, setValue] = useState('');
  
  // State for dual input (ft/in)
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');

  useEffect(() => {
    if (visible) {
      setUnit(initialUnit);
      if (initialUnit === 'ft') {
        // Try to parse "5'8" or similar if passed, otherwise reset
        const parts = initialValue.split("'");
        if (parts.length === 2) {
          setFeet(parts[0]);
          setInches(parts[1]);
        } else {
           // If value is just a number (like converted cm?), try to infer?
           // For now, just reset or keep raw if it looks like feet
           setFeet('');
           setInches('');
        }
        setValue('');
      } else {
        setValue(initialValue);
        setFeet('');
        setInches('');
      }
    }
  }, [visible, initialValue, initialUnit]);

  // Simple conversion handler when switching units
  const handleUnitChange = (newUnit: string) => {
    if (unit === newUnit) return;
    
    // Attempt conversion (Basic approximation for UX)
    // cm <-> ft
    if (unit === 'cm' && newUnit === 'ft' && value) {
      const cm = parseFloat(value);
      if (!isNaN(cm)) {
        const totalInches = cm / 2.54;
        const f = Math.floor(totalInches / 12);
        const i = Math.round(totalInches % 12);
        setFeet(f.toString());
        setInches(i.toString());
      }
    } else if (unit === 'ft' && newUnit === 'cm' && feet) {
      const f = parseFloat(feet) || 0;
      const i = parseFloat(inches) || 0;
      const cm = Math.round((f * 12 + i) * 2.54);
      setValue(cm.toString());
    } 
    // kg <-> lb
    else if (unit === 'kg' && newUnit === 'lb' && value) {
      const kg = parseFloat(value);
      if (!isNaN(kg)) setValue(Math.round(kg * 2.20462).toString());
    } else if (unit === 'lb' && newUnit === 'kg' && value) {
      const lb = parseFloat(value);
      if (!isNaN(lb)) setValue(Math.round(lb / 2.20462).toString());
    }

    setUnit(newUnit);
  };

  const handleSave = () => {
    if (unit === 'ft') {
      // Save as 5'8 format or just save feet?
      // Consumer expects string.
      const f = feet || '0';
      const i = inches || '0';
      onSave(`${f}'${i}`, unit);
    } else {
      onSave(value, unit);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.container, { backgroundColor: colors.card }]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={colors.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.contentContainer}>
                 {unit === 'ft' ? (
                   <View style={styles.dualInputContainer}>
                     <View style={styles.inputWrapper}>
                       <TextInput
                         style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                         value={feet}
                         onChangeText={setFeet}
                         placeholder="0"
                         placeholderTextColor={colors.textLight}
                         keyboardType="number-pad"
                         returnKeyType="next"
                       />
                       <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>ft</Text>
                     </View>
                     <View style={styles.inputWrapper}>
                       <TextInput
                         style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                         value={inches}
                         onChangeText={setInches}
                         placeholder="0"
                         placeholderTextColor={colors.textLight}
                         keyboardType="number-pad"
                         returnKeyType="done"
                       />
                       <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>in</Text>
                     </View>
                   </View>
                 ) : (
                   <TextInput
                     style={[styles.singleInput, { color: colors.text, borderColor: colors.border }]}
                     value={value}
                     onChangeText={setValue}
                     placeholder="0.0"
                     placeholderTextColor={colors.textLight}
                     keyboardType="decimal-pad"
                     autoFocus
                   />
                 )}
                
                <View style={[styles.unitContainer, { backgroundColor: colors.backgroundSecondary }]}>
                  {units.map((u) => (
                    <Pressable
                      key={u.value}
                      style={[
                        styles.unitButton,
                        unit === u.value && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => handleUnitChange(u.value)}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          { color: unit === u.value ? colors.white : colors.textSecondary },
                        ]}
                      >
                        {u.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Check size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={[styles.saveButtonText, { color: colors.white }]}>Save</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    flexDirection: 'column', // Stack input and units on small screens if needed, but row looks better usually
    gap: 16,
    marginBottom: 24,
  },
  singleInput: {
    height: 64,
    borderWidth: 1,
    borderRadius: 16,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  dualInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    height: 64,
    borderWidth: 1,
    borderRadius: 16,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingRight: 40, // Space for label
  },
  inputLabel: {
    position: 'absolute',
    right: 16,
    top: 24,
    fontSize: 16,
    fontWeight: '600',
  },
  unitContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%', // Full width on small screens
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
