import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../utils/haptics';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';
import { useReferralStore } from '../../stores';

interface ReferralBannerProps {
  onPress: () => void;
}

export function ReferralBanner({ onPress }: ReferralBannerProps) {
  const { stats, weekendStatus } = useReferralStore();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 165, 0, 0.15)', 'rgba(255, 100, 0, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#FF9500', '#FF6600'] as [string, string]}
            style={styles.icon}
          >
            <Ionicons name="gift" size={20} color={colors.white} />
          </LinearGradient>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Parrainage</Text>
            {weekendStatus?.isWeekend && (
              <View style={styles.bonusBadge}>
                <Text style={styles.bonusText}>x{weekendStatus.multiplier}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            Gagnez des crédits en invitant vos amis
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsValue}>{stats?.totalReferrals || 0}</Text>
          <Text style={styles.statsLabel}>invités</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#FF9500" />
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
    borderColor: 'rgba(255, 165, 0, 0.2)',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  bonusBadge: {
    marginLeft: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FF9500',
  },
  bonusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statsContainer: {
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9500',
  },
  statsLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});
