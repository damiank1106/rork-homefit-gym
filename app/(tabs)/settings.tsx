import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Moon,
  Sun,
  ChevronRight,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  Palette,
  ToggleLeft,
  Layout,
  X,
  Check,
} from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { clearUserProfile } from '@/src/storage/profileStorage';
import { clearAllLogs } from '@/src/storage/historyStorage'; // Optional debug

const COLOR_PALETTE = [
  '#E8B4BC', // Default Pink
  '#7BC9A4', // Green
  '#F5C77E', // Yellow/Orange
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E74C3C', // Red
  '#1ABC9C', // Teal
  '#34495E', // Navy
  '#FF69B4', // Hot Pink
  '#2ECC71', // Emerald
];

interface ColorPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (color: string | null) => void;
  selectedColor: string | null;
  title: string;
  colors: any;
}

const ColorPickerModal = ({ visible, onClose, onSelect, selectedColor, title, colors }: ColorPickerModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
                <Pressable onPress={onClose}>
                  <X size={24} color={colors.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.colorGrid}>
                <Pressable
                  style={[
                    styles.colorOption,
                    selectedColor === null && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => {
                    onSelect(null);
                    onClose();
                  }}
                >
                  <View style={[styles.colorCircle, { backgroundColor: colors.textLight, opacity: 0.3 }]} />
                  <Text style={[styles.colorLabel, { color: colors.text }]}>Default</Text>
                  {selectedColor === null && (
                    <View style={styles.checkOverlay}>
                      <Check size={16} color={colors.primary} />
                    </View>
                  )}
                </Pressable>

                {COLOR_PALETTE.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorOption,
                      selectedColor === color && { borderColor: colors.primary, borderWidth: 2 },
                    ]}
                    onPress={() => {
                      onSelect(color);
                      onClose();
                    }}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: color }]} />
                    {selectedColor === color && (
                      <View style={styles.checkOverlay}>
                        <Check size={16} color={colors.white} strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default function SettingsScreen() {
  const { 
    theme, 
    toggleTheme, 
    colors, 
    customIconColor, 
    setCustomIconColor,
    customSwitchColor,
    setCustomSwitchColor,
    customContainerColor,
    setCustomContainerColor
  } = useTheme();
  
  const [iconColorModalVisible, setIconColorModalVisible] = useState(false);
  const [switchColorModalVisible, setSwitchColorModalVisible] = useState(false);
  const [containerColorModalVisible, setContainerColorModalVisible] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const SettingsItem = ({
    icon: Icon,
    label,
    onPress,
    rightElement,
    color,
  }: {
    icon: any;
    label: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    color?: string;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color ? color + '20' : (customIconColor || colors.accent) }]}>
        <Icon size={20} color={color || customIconColor || colors.primary} />
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
      {rightElement || <ChevronRight size={18} color={colors.textLight} />}
    </Pressable>
  );

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMiddle, colors.background]}
      locations={[0, 0.3, 0.6]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.headerTitle}>Settings</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.card}>
              <SettingsItem
                icon={theme === 'dark' ? Moon : Sun}
                label="Dark Mode"
                rightElement={
                  <Switch
                    value={theme === 'dark'}
                    onValueChange={toggleTheme}
                    trackColor={{ false: colors.border, true: customSwitchColor || colors.primary }}
                    thumbColor={colors.white}
                  />
                }
              />
              <View style={styles.divider} />
              <SettingsItem
                icon={Palette}
                label="Icon Color"
                rightElement={
                  <View style={[styles.colorPreview, { backgroundColor: customIconColor || colors.primary }]} />
                }
                onPress={() => setIconColorModalVisible(true)}
              />
              <View style={styles.divider} />
              <SettingsItem
                icon={ToggleLeft}
                label="Switch Color"
                rightElement={
                  <View style={[styles.colorPreview, { backgroundColor: customSwitchColor || colors.primary }]} />
                }
                onPress={() => setSwitchColorModalVisible(true)}
              />
              <View style={styles.divider} />
              <SettingsItem
                icon={Layout}
                label="Container Background"
                rightElement={
                  <View style={[styles.colorPreview, { backgroundColor: customContainerColor || colors.primary }]} />
                }
                onPress={() => setContainerColorModalVisible(true)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            <View style={styles.card}>
              <SettingsItem
                icon={Shield}
                label="Privacy Policy"
                onPress={() => {}}
              />
              <View style={styles.divider} />
              <SettingsItem
                icon={FileText}
                label="Terms of Service"
                onPress={() => {}}
              />
              <View style={styles.divider} />
              <SettingsItem
                icon={HelpCircle}
                label="Help & Support"
                onPress={() => {}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <View style={styles.card}>
              <SettingsItem
                icon={LogOut}
                label="Reset Data"
                color={colors.error}
                onPress={() => {
                  Alert.alert(
                    "Reset Data",
                    "Are you sure you want to delete all your data? This action cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Reset",
                        style: "destructive",
                        onPress: async () => {
                          await clearAllLogs();
                          await clearUserProfile();
                          Alert.alert("Success", "All data has been reset.");
                        }
                      }
                    ]
                  );
                }}
              />
            </View>
          </View>

          <Text style={styles.version}>HomeFit Gym v1.0.0</Text>
        </ScrollView>

        <ColorPickerModal
          visible={iconColorModalVisible}
          onClose={() => setIconColorModalVisible(false)}
          onSelect={setCustomIconColor}
          selectedColor={customIconColor}
          title="Select Icon Color"
          colors={colors}
        />
        <ColorPickerModal
          visible={switchColorModalVisible}
          onClose={() => setSwitchColorModalVisible(false)}
          onSelect={setCustomSwitchColor}
          selectedColor={customSwitchColor}
          title="Select Switch Color"
          colors={colors}
        />
        <ColorPickerModal
          visible={containerColorModalVisible}
          onClose={() => setContainerColorModalVisible(false)}
          onSelect={setCustomContainerColor}
          selectedColor={customContainerColor}
          title="Select Container Color"
          colors={colors}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  colorOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'relative',
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  colorLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  checkOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
  },
  itemPressed: {
    backgroundColor: colors.backgroundSecondary,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 66,
  },
  version: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 13,
    marginTop: 10,
  },
});
