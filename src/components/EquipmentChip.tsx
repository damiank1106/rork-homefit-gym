import React, { useRef } from 'react';
import { Text, StyleSheet, Pressable, Animated, View } from 'react-native';
import {
  User,
  Square,
  Dumbbell,
  Circle,
  Link2,
  Trophy,
  Armchair,
  Zap,
  CircleDot,
  Cylinder,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Equipment } from '@/src/types/training';

interface EquipmentChipProps {
  equipment: Equipment;
  isSelected: boolean;
  onPress: () => void;
}

const EQUIPMENT_ICONS: Record<string, React.ElementType> = {
  bodyweight: User,
  mat: Square,
  dumbbells: Dumbbell,
  mini_band: Circle,
  long_band: Link2,
  kettlebell: Trophy,
  chair_step: Armchair,
  jump_rope: Zap,
  stability_ball: CircleDot,
  foam_roller: Cylinder,
};

export default function EquipmentChip({ equipment, isSelected, onPress }: EquipmentChipProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const IconComponent = EQUIPMENT_ICONS[equipment.id] || Circle;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.chip, isSelected && styles.chipSelected]}
        testID={`equipment-chip-${equipment.id}`}
      >
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <IconComponent
            size={16}
            color={isSelected ? Colors.white : Colors.textSecondary}
          />
        </View>
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
          {equipment.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: 10,
    gap: 8,
  },
  chipSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
});
