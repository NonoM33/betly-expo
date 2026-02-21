import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/theme';
import type { TicketSelection as TicketSelectionType } from '../../types';

interface TicketSelectionProps {
  selection: TicketSelectionType;
  onRemove: () => void;
}

export function TicketSelection({ selection, onRemove }: TicketSelectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.matchInfo}>
          <Text style={styles.matchTitle} numberOfLines={1}>
            {selection.match.homeTeam.name} vs {selection.match.awayTeam.name}
          </Text>
          <Text style={styles.betType}>{selection.bet}</Text>
        </View>
        <View style={styles.oddsContainer}>
          <Text style={styles.odds}>{selection.odds.toFixed(2)}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Ionicons name="close-circle" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  matchTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  betType: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  oddsContainer: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  odds: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  removeButton: {
    marginLeft: spacing.sm,
    padding: 4,
  },
});
