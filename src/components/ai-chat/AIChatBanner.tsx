import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';

interface AIChatBannerProps {
  onPress: () => void;
  compact?: boolean;
}

export function AIChatBanner({ onPress, compact = false }: AIChatBannerProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (compact) {
    return (
      <TouchableOpacity onPress={handlePress} style={styles.compactContainer}>
        <LinearGradient
          colors={gradients.primary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.compactGradient}
        >
          <Ionicons name="sparkles" size={14} color={colors.white} />
          <Text style={styles.compactText}>Poser une question à l'IA</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 255, 136, 0.15)', 'rgba(0, 255, 136, 0.05)']}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={gradients.primary as [string, string]}
            style={styles.icon}
          >
            <Ionicons name="sparkles" size={20} color={colors.white} />
          </LinearGradient>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Assistant IA Expert</Text>
          <Text style={styles.subtitle}>
            Posez vos questions et recevez une analyse approfondie
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.accent} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  compactContainer: {
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  compactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  compactText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.white,
  },
});
