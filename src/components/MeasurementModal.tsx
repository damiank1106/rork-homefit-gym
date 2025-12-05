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
  const [value, setValue] = useState(initialValue);
  const [unit, setUnit] = useState(initialUnit);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setUnit(initialUnit);
    }
  }, [visible, initialValue, initialUnit]);

  const handleSave = () => {
    onSave(value, unit);
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

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  value={value}
                  onChangeText={setValue}
                  placeholder="0.0"
                  placeholderTextColor={colors.textLight}
                  keyboardType="decimal-pad"
                  autoFocus
                />
                
                <View style={[styles.unitContainer, { backgroundColor: colors.backgroundSecondary }]}>
                  {units.map((u) => (
                    <Pressable
                      key={u.value}
                      style={[
                        styles.unitButton,
                        unit === u.value && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setUnit(u.value)}
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
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  unitContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    alignItems: 'center',
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
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
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
