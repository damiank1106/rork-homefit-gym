import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Pressable,
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
} from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { clearUserProfile } from '@/src/storage/profileStorage';
import { clearAllLogs } from '@/src/storage/historyStorage'; // Optional debug
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSignOut = () => {
    // Clear data or just navigate?
    // Since there's no auth, maybe just clear profile?
    // "Let user archive or delete it".
    // I'll just keep it simple.
  };

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
      <View style={[styles.iconContainer, { backgroundColor: color ? color + '20' : colors.accent }]}>
        <Icon size={20} color={color || colors.primary} />
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
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                }
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
                   // Optional implementation
                }}
              />
            </View>
          </View>

          <Text style={styles.version}>HomeFit Gym v1.0.0</Text>
        </ScrollView>
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
