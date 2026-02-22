import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../utils/haptics';
import { useRouter } from 'expo-router';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';
import { useTicketStore } from '../../stores';
import { TicketSelection } from './TicketSelection';

interface TicketBuilderProps {
  onSave?: () => void;
}

export function TicketBuilder({ onSave }: TicketBuilderProps) {
  const router = useRouter();
  const {
    currentTicket,
    removeSelection,
    updateStake,
    clearTicket,
    saveTicket,
    isSaving,
    getTotalOdds,
    getPotentialWin,
  } = useTicketStore();

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const ticket = await saveTicket();
    if (ticket) {
      onSave?.();
    }
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearTicket();
  };

  const totalOdds = getTotalOdds();
  const potentialWin = getPotentialWin();

  if (currentTicket.selections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={gradients.primary as [string, string]}
          style={styles.emptyIcon}
        >
          <Ionicons name="receipt-outline" size={32} color={colors.white} />
        </LinearGradient>
        <Text style={styles.emptyTitle}>Ticket vide</Text>
        <Text style={styles.emptyText}>
          Ajoutez des paris depuis les matchs pour créer votre ticket
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/matches')}
        >
          <Text style={styles.browseText}>Parcourir les matchs</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="receipt" size={20} color={colors.accent} />
          <Text style={styles.headerTitle}>Mon Ticket</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{currentTicket.selections.length}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearText}>Vider</Text>
        </TouchableOpacity>
      </View>

      {/* Selections */}
      <ScrollView style={styles.selections} showsVerticalScrollIndicator={false}>
        {currentTicket.selections.map((selection, index) => (
          <TicketSelection
            key={`${selection.matchId}-${index}`}
            selection={selection}
            onRemove={() => removeSelection(selection.matchId)}
          />
        ))}
      </ScrollView>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Cote totale</Text>
          <Text style={styles.summaryValue}>{(totalOdds ?? 0).toFixed(2)}</Text>
        </View>

        <View style={styles.stakeRow}>
          <Text style={styles.summaryLabel}>Mise</Text>
          <View style={styles.stakeInput}>
            <TouchableOpacity
              style={styles.stakeButton}
              onPress={() => updateStake(currentTicket.stake - 5)}
            >
              <Ionicons name="remove" size={18} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.stakeValue}>{currentTicket.stake}€</Text>
            <TouchableOpacity
              style={styles.stakeButton}
              onPress={() => updateStake(currentTicket.stake + 5)}
            >
              <Ionicons name="add" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.potentialLabel}>Gain potentiel</Text>
          <Text style={styles.potentialValue}>{(potentialWin ?? 0).toFixed(2)}€</Text>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={isSaving}
      >
        <LinearGradient
          colors={gradients.primary as [string, string]}
          style={styles.saveGradient}
        >
          {isSaving ? (
            <Text style={styles.saveText}>Enregistrement...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.saveText}>Valider le ticket</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  browseText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  countBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
  },
  clearText: {
    fontSize: 14,
    color: colors.error,
  },
  selections: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  summary: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  stakeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stakeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 4,
  },
  stakeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },
  stakeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    paddingHorizontal: spacing.md,
    minWidth: 60,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  potentialLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  potentialValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
  },
  saveButton: {
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
