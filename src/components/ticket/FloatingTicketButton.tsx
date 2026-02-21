import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';
import { useTicketStore } from '../../stores';

interface FloatingTicketButtonProps {
  onPress: () => void;
}

export function FloatingTicketButton({ onPress }: FloatingTicketButtonProps) {
  const { getSelectionCount, getTotalOdds } = useTicketStore();
  const count = getSelectionCount();
  const totalOdds = getTotalOdds();

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [count]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  if (count === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={gradients.primary as [string, string]}
          style={styles.button}
        >
          <Ionicons name="receipt" size={20} color={colors.white} />
          <Text style={styles.text}>
            {count} pari{count > 1 ? 's' : ''} • {totalOdds.toFixed(2)}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Above tab bar
    alignSelf: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
