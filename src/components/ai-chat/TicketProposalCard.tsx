import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../utils/haptics';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';
import { useAIChatStore, useTicketStore } from '../../stores';
import type { TicketProposal } from '../../types';

interface TicketProposalCardProps {
  proposal: TicketProposal;
  matchId: number;
}

export function TicketProposalCard({ proposal, matchId }: TicketProposalCardProps) {
  const { updateTicketStatus } = useAIChatStore();
  const { addSelection } = useTicketStore();

  const handleAccept = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Add selections to ticket
    for (const selection of proposal.selections) {
      addSelection(selection);
    }

    // Update status
    await updateTicketStatus(proposal.id, 'accepted');
  };

  const handleDecline = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateTicketStatus(proposal.id, 'declined');
  };

  const isAccepted = proposal.status === 'accepted';
  const isDeclined = proposal.status === 'declined';
  const isPending = proposal.status === 'pending';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 255, 136, 0.1)', 'rgba(0, 255, 136, 0.05)']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="receipt" size={16} color={colors.accent} />
            <Text style={styles.headerTitle}>Proposition de pari</Text>
          </View>
          <View style={styles.oddsContainer}>
            <Text style={styles.oddsLabel}>Cote:</Text>
            <Text style={styles.oddsValue}>{proposal.totalOdds.toFixed(2)}</Text>
          </View>
        </View>

        {/* Selections */}
        <View style={styles.selections}>
          {proposal.selections.map((selection, index) => (
            <View key={index} style={styles.selection}>
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionMatch} numberOfLines={1}>
                  {selection.match.homeTeam.name} vs {selection.match.awayTeam.name}
                </Text>
                <Text style={styles.selectionBet}>{selection.bet}</Text>
              </View>
              <Text style={styles.selectionOdds}>{selection.odds.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Reasoning */}
        <Text style={styles.reasoning}>{proposal.reasoning}</Text>

        {/* Risks */}
        {proposal.risks.length > 0 && (
          <View style={styles.risks}>
            <Text style={styles.risksTitle}>
              <Ionicons name="warning" size={12} color={colors.warning} /> Risques:
            </Text>
            {proposal.risks.map((risk, index) => (
              <Text key={index} style={styles.riskItem}>• {risk}</Text>
            ))}
          </View>
        )}

        {/* Actions */}
        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={handleDecline}
            >
              <Text style={styles.declineText}>Ignorer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAccept}
            >
              <LinearGradient
                colors={gradients.primary as [string, string]}
                style={styles.acceptGradient}
              >
                <Ionicons name="checkmark" size={18} color={colors.white} />
                <Text style={styles.acceptText}>Ajouter au ticket</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Status badges */}
        {isAccepted && (
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.statusText}>Ajouté au ticket</Text>
          </View>
        )}
        {isDeclined && (
          <View style={styles.statusBadge}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            <Text style={styles.statusTextMuted}>Ignoré</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  gradient: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  oddsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oddsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 4,
  },
  oddsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  selections: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  selection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  selectionInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  selectionMatch: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectionBet: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  selectionOdds: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  reasoning: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  risks: {
    marginBottom: spacing.sm,
  },
  risksTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.warning,
    marginBottom: 4,
  },
  riskItem: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  declineButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  declineText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  acceptButton: {
    flex: 2,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  acceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 4,
  },
  statusTextMuted: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },
});
