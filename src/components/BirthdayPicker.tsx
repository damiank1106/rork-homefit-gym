import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/src/context/ThemeContext';
import { X, Check } from 'lucide-react-native';

interface BirthdayPickerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (date: string) => void;
  initialDate?: string | null;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BirthdayPicker({
  visible,
  onClose,
  onSave,
  initialDate,
}: BirthdayPickerProps) {
  const { colors } = useTheme();
  
  const initial = useMemo(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      if (!isNaN(d.getTime())) {
        return {
          year: d.getFullYear(),
          month: d.getMonth(),
          day: d.getDate(),
        };
      }
    }
    const today = new Date();
    return {
      year: today.getFullYear() - 25, // Default to 25 years ago
      month: 0,
      day: 1,
    };
  }, [initialDate]);

  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedDay, setSelectedDay] = useState(initial.day);

  // Generate years (1900 - Current)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const ys = [];
    for (let i = currentYear; i >= 1900; i--) {
      ys.push(i);
    }
    return ys;
  }, []);

  // Generate days based on month/year
  const days = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const ds = [];
    for (let i = 1; i <= daysInMonth; i++) {
      ds.push(i);
    }
    return ds;
  }, [selectedYear, selectedMonth]);

  const handleSave = () => {
    // Format YYYY-MM-DD
    const date = new Date(Date.UTC(selectedYear, selectedMonth, selectedDay));
    const formatted = date.toISOString().split('T')[0];
    onSave(formatted);
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
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: colors.card }]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Select Birthday</Text>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={colors.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.pickersContainer}>
                {/* Month Picker */}
                <View style={styles.pickerWrapper}>
                  <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Month</Text>
                  <Picker
                    selectedValue={selectedMonth}
                    onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                    style={[styles.picker, { color: colors.text }]}
                    itemStyle={{ color: colors.text, fontSize: 16 }}
                  >
                    {MONTHS.map((month, index) => (
                      <Picker.Item key={month} label={month} value={index} />
                    ))}
                  </Picker>
                </View>

                {/* Day Picker */}
                <View style={[styles.pickerWrapper, { flex: 0.6 }]}>
                  <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Day</Text>
                  <Picker
                    selectedValue={selectedDay}
                    onValueChange={(itemValue) => setSelectedDay(itemValue)}
                    style={[styles.picker, { color: colors.text }]}
                    itemStyle={{ color: colors.text, fontSize: 16 }}
                  >
                    {days.map((day) => (
                      <Picker.Item key={day} label={day.toString()} value={day} />
                    ))}
                  </Picker>
                </View>

                {/* Year Picker */}
                <View style={styles.pickerWrapper}>
                  <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Year</Text>
                  <Picker
                    selectedValue={selectedYear}
                    onValueChange={(itemValue) => setSelectedYear(itemValue)}
                    style={[styles.picker, { color: colors.text }]}
                    itemStyle={{ color: colors.text, fontSize: 16 }}
                  >
                    {years.map((year) => (
                      <Picker.Item key={year} label={year.toString()} value={year} />
                    ))}
                  </Picker>
                </View>
              </View>

              <Pressable
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Check size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={[styles.saveButtonText, { color: colors.white }]}>Confirm</Text>
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
    maxWidth: 500,
    borderRadius: 20,
    padding: 20,
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
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  pickersContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  pickerWrapper: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    height: 150, // Height for standard wheel picker look on Web/Mobile
    ...Platform.select({
      web: {
        height: 40, // Standard select height on web
      },
      android: {
        height: 50, // Android dropdown
      },
    }),
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
