import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BarChart3,
  Flame,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { ExerciseLog } from '@/src/types/history';
import { getExerciseLogs, deleteExerciseLog } from '@/src/storage/historyStorage';
import { useFocusEffect } from 'expo-router';

const PERIODS = [
  { key: 'day', label: 'Day' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
] as const;

type Period = typeof PERIODS[number]['key'];

export default function ChartsScreen() {
  const { colors } = useTheme();
  const [activePeriod, setActivePeriod] = useState<Period>('month');
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [referenceDate, setReferenceDate] = useState(new Date());

  const loadLogs = useCallback(async () => {
    const stored = await getExerciseLogs();
    // Sort by newest first
    setLogs(stored.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [loadLogs, fadeAnim])
  );

  const handleDelete = async (logId: string) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
             await deleteExerciseLog(logId);
             loadLogs();
          }
        }
      ]
    );
  };

  const filteredLogs = useMemo(() => {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    const day = referenceDate.getDate();

    return logs.filter(log => {
      const logDate = new Date(log.date); // log.date is YYYY-MM-DD
      // Note: new Date("YYYY-MM-DD") is usually UTC. 
      // But getLocalDateString returns local YYYY-MM-DD.
      // Let's rely on string comparison for day, substring for month/year to be safe against timezone shifts.
      
      const [lYear, lMonth, lDay] = log.date.split('-').map(Number);
      
      if (activePeriod === 'day') {
        return lYear === year && lMonth === month + 1 && lDay === day;
      } else if (activePeriod === 'month') {
        return lYear === year && lMonth === month + 1;
      } else {
        return lYear === year;
      }
    });
  }, [logs, activePeriod, referenceDate]);

  const chartData = useMemo(() => {
    // Generate bars based on period
    if (activePeriod === 'day') {
      // For day, maybe show distribution by time of day? 
      // Or simply simple stats. Let's return empty array and handle "Day" differently or 
      // split by 6-hour blocks: Morning, Afternoon, Evening, Night
      const blocks = [
        { label: 'Morning', start: 5, end: 11, value: 0 },
        { label: 'Afternoon', start: 12, end: 17, value: 0 },
        { label: 'Evening', start: 18, end: 22, value: 0 },
        { label: 'Night', start: 23, end: 4, value: 0 }, // Simplified
      ];
      
      filteredLogs.forEach(log => {
        const hour = new Date(log.timestamp).getHours();
        if (hour >= 5 && hour <= 11) blocks[0].value += (log.calories ?? 0);
        else if (hour >= 12 && hour <= 17) blocks[1].value += (log.calories ?? 0);
        else if (hour >= 18 && hour <= 22) blocks[2].value += (log.calories ?? 0);
        else blocks[3].value += (log.calories ?? 0);
      });
      return blocks;
    } 
    else if (activePeriod === 'month') {
      // Days 1..31
      const daysInMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
      const data: { label: string; value: number }[] = [];
      for(let i=1; i<=daysInMonth; i++) {
         data.push({ label: `${i}`, value: 0 });
      }
      filteredLogs.forEach(log => {
         const d = parseInt(log.date.split('-')[2], 10);
         if (d >= 1 && d <= daysInMonth) {
            data[d-1].value += (log.calories ?? 0);
         }
      });
      return data;
    }
    else {
      // Year: Jan..Dec
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data: { label: string; value: number }[] = months.map(m => ({ label: m, value: 0 }));
      filteredLogs.forEach(log => {
         const m = parseInt(log.date.split('-')[1], 10); // 1-12
         if (m >= 1 && m <= 12) {
            data[m-1].value += (log.calories ?? 0);
         }
      });
      return data;
    }
  }, [filteredLogs, activePeriod, referenceDate]);

  const stats = useMemo(() => {
    const totalCal = filteredLogs.reduce((sum, log) => sum + (log.calories ?? 0), 0);
    const totalMin = filteredLogs.reduce((sum, log) => sum + log.durationSeconds, 0) / 60;
    return {
      calories: Math.round(totalCal),
      minutes: Math.round(totalMin),
      count: filteredLogs.length
    };
  }, [filteredLogs]);

  const maxChartValue = Math.max(...chartData.map(d => d.value), 10);

  const navigateDate = (dir: -1 | 1) => {
    const newDate = new Date(referenceDate);
    if (activePeriod === 'day') {
      newDate.setDate(newDate.getDate() + dir);
    } else if (activePeriod === 'month') {
      newDate.setMonth(newDate.getMonth() + dir);
    } else {
      newDate.setFullYear(newDate.getFullYear() + dir);
    }
    setReferenceDate(newDate);
  };

  const periodLabel = useMemo(() => {
    if (activePeriod === 'day') {
       return referenceDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (activePeriod === 'month') {
       return referenceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
       return referenceDate.getFullYear().toString();
    }
  }, [activePeriod, referenceDate]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMiddle, colors.background]}
      locations={[0, 0.3, 0.6]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <BarChart3 size={22} color={colors.primary} strokeWidth={2.2} />
                <Text style={styles.title}>Progress Charts</Text>
              </View>
            </View>

            {/* Period Selector */}
            <View style={styles.periodSelector}>
              {PERIODS.map((p) => (
                 <Pressable
                   key={p.key}
                   style={[styles.periodButton, activePeriod === p.key && { backgroundColor: colors.primary }]}
                   onPress={() => {
                     setActivePeriod(p.key);
                     setReferenceDate(new Date()); // Reset to today when switching view logic preference? Or keep context? Let's reset for simplicity.
                   }}
                 >
                   <Text style={[styles.periodText, activePeriod === p.key && { color: colors.white }]}>
                     {p.label}
                   </Text>
                 </Pressable>
              ))}
            </View>

            {/* Date Navigator */}
            <View style={styles.dateNav}>
               <Pressable onPress={() => navigateDate(-1)} style={styles.navButton}>
                 <ChevronLeft size={24} color={colors.textSecondary} />
               </Pressable>
               <Text style={styles.dateLabel}>{periodLabel}</Text>
               <Pressable onPress={() => navigateDate(1)} style={styles.navButton}>
                 <ChevronRight size={24} color={colors.textSecondary} />
               </Pressable>
            </View>

            {/* Main Chart Card */}
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                 <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.calories}</Text>
                    <Text style={styles.statLabel}>KCAL</Text>
                 </View>
                 <View style={styles.statDivider} />
                 <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.minutes}</Text>
                    <Text style={styles.statLabel}>MINUTES</Text>
                 </View>
                 <View style={styles.statDivider} />
                 <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.count}</Text>
                    <Text style={styles.statLabel}>WORKOUTS</Text>
                 </View>
              </View>
              
              <View style={styles.chartContainer}>
                {chartData.map((d, i) => {
                  // If too many bars (e.g. 31 days), maybe skip labels or make thin
                  const isDense = chartData.length > 12;
                  return (
                    <View key={i} style={styles.barWrapper}>
                       <View style={styles.barTrack}>
                          <View style={[styles.barFill, { height: `${(d.value / maxChartValue) * 100}%` }]} />
                       </View>
                       {!isDense || i % 5 === 0 ? (
                         <Text style={styles.barLabel}>{d.label}</Text>
                       ) : null}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* History List */}
            <Text style={styles.sectionTitle}>History</Text>
            {filteredLogs.length === 0 ? (
               <View style={styles.emptyState}>
                 <Text style={styles.emptyText}>No workouts recorded for this period.</Text>
               </View>
            ) : (
               filteredLogs.map((log) => (
                  <View key={log.id} style={styles.logCard}>
                     <View style={styles.logInfo}>
                        <Text style={styles.logTitle}>{log.exerciseName}</Text>
                        <Text style={styles.logDate}>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {Math.round(log.durationSeconds / 60)} min</Text>
                     </View>
                     <View style={styles.logRight}>
                        <View style={styles.caloriesBadge}>
                           <Flame size={12} color={colors.warning} />
                           <Text style={styles.caloriesText}>{log.calories ?? 0}</Text>
                        </View>
                        <Pressable onPress={() => handleDelete(log.id)} style={styles.deleteButton}>
                           <Trash2 size={18} color={colors.textLight} />
                        </Pressable>
                     </View>
                  </View>
               ))
            )}

          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  header: { marginTop: 12, marginBottom: 18 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  periodSelector: {
     flexDirection: 'row',
     backgroundColor: colors.card,
     borderRadius: 12,
     padding: 4,
     marginBottom: 20
  },
  periodButton: {
     flex: 1,
     paddingVertical: 8,
     alignItems: 'center',
     borderRadius: 8,
  },
  periodText: {
     fontWeight: '600',
     color: colors.textSecondary,
     fontSize: 13
  },
  dateNav: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 20,
     paddingHorizontal: 10
  },
  navButton: { padding: 8 },
  dateLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 10, fontWeight: '700', color: colors.textLight, marginTop: 4 },
  statDivider: { width: 1, height: '100%', backgroundColor: colors.border },
  chartContainer: {
     flexDirection: 'row',
     alignItems: 'flex-end',
     height: 150,
     gap: 4
  },
  barWrapper: { flex: 1, alignItems: 'center', height: '100%' },
  barTrack: { 
     flex: 1, 
     width: 8, 
     backgroundColor: colors.backgroundSecondary, 
     borderRadius: 4, 
     justifyContent: 'flex-end',
     marginBottom: 8,
     overflow: 'hidden'
  },
  barFill: { width: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  barLabel: { fontSize: 10, color: colors.textLight },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { color: colors.textSecondary },
  logCard: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: colors.card,
     padding: 16,
     borderRadius: 12,
     marginBottom: 10,
     shadowColor: colors.shadowColor,
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.05,
     shadowRadius: 4,
     elevation: 2
  },
  logInfo: { flex: 1 },
  logTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 },
  logDate: { fontSize: 12, color: colors.textSecondary },
  logRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  caloriesBadge: { 
     flexDirection: 'row', 
     alignItems: 'center', 
     gap: 4, 
     backgroundColor: colors.backgroundSecondary,
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 8
  },
  caloriesText: { fontSize: 12, fontWeight: '600', color: colors.text },
  deleteButton: { padding: 4 }
});
