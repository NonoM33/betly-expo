import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';
import type { AIChatMessage as AIChatMessageType } from '../../types';
import { TicketProposalCard } from './TicketProposalCard';

interface AIChatMessageProps {
  message: AIChatMessageType;
  matchId: number;
}

export function AIChatMessage({ message, matchId }: AIChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      {!isUser && (
        <LinearGradient
          colors={gradients.primary as [string, string]}
          style={styles.avatar}
        >
          <Ionicons name="sparkles" size={14} color={colors.white} />
        </LinearGradient>
      )}

      <View style={styles.content}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAI,
          ]}
        >
          <Text style={[styles.text, isUser && styles.textUser]}>
            {message.content}
          </Text>
        </View>

        {/* Ticket Proposal */}
        {message.ticketProposal && (
          <TicketProposalCard
            proposal={message.ticketProposal}
            matchId={matchId}
          />
        )}

        {/* Metadata */}
        <View style={[styles.meta, isUser && styles.metaUser]}>
          <Text style={styles.time}>
            {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {message.tokensUsed && (
            <Text style={styles.tokens}>
              <Ionicons name="flash" size={10} color={colors.textMuted} />{' '}
              {message.tokensUsed}
            </Text>
          )}
        </View>
      </View>

      {isUser && (
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={14} color={colors.white} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  containerUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 4,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  bubble: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  bubbleAI: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
  },
  textUser: {
    color: colors.background,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingLeft: 4,
  },
  metaUser: {
    justifyContent: 'flex-end',
    paddingRight: 4,
    paddingLeft: 0,
  },
  time: {
    fontSize: 10,
    color: colors.textMuted,
  },
  tokens: {
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
});
