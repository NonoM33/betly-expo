import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAIChatStore } from '../../stores';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';
import { AIChatMessage } from './AIChatMessage';
import { AIChatInput } from './AIChatInput';
import type { Match } from '../../types';

interface AIChatSheetProps {
  match: Match;
  onClose: () => void;
}

export function AIChatSheet({ match, onClose }: AIChatSheetProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    messages,
    isLoading,
    tokenUsage,
    sendMessage,
    loadHistory,
    loadUsage,
  } = useAIChatStore();

  const matchMessages = messages[match.id] || [];

  useEffect(() => {
    loadHistory(match.id);
    loadUsage();
  }, [match.id]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [matchMessages.length]);

  const handleSend = async (text: string) => {
    await sendMessage(match.id, text);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={gradients.primary as [string, string]}
              style={styles.aiIcon}
            >
              <Ionicons name="sparkles" size={16} color={colors.white} />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Assistant IA Expert</Text>
              <Text style={styles.headerSubtitle}>
                {match.homeTeam.name} vs {match.awayTeam.name}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Token usage */}
        {tokenUsage && (
          <View style={styles.usageBar}>
            <View style={styles.usageInfo}>
              <Ionicons name="flash" size={14} color={colors.accent} />
              <Text style={styles.usageText}>
                {tokenUsage.remaining.toLocaleString()} tokens restants
              </Text>
            </View>
            <View style={styles.usageProgress}>
              <View
                style={[
                  styles.usageProgressFill,
                  { width: `${(tokenUsage.remaining / tokenUsage.limit) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}
      </BlurView>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {matchMessages.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={gradients.primary as [string, string]}
                style={styles.emptyIcon}
              >
                <Ionicons name="chatbubbles" size={32} color={colors.white} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>Analyse IA Expert</Text>
              <Text style={styles.emptyText}>
                Posez vos questions sur ce match et recevez une analyse approfondie basée sur les statistiques et l'IA.
              </Text>
              <View style={styles.suggestions}>
                <Text style={styles.suggestionsTitle}>Suggestions :</Text>
                {[
                  'Quel est le meilleur pari pour ce match ?',
                  'Analyse les forces et faiblesses des équipes',
                  'Y a-t-il des joueurs blessés importants ?',
                ].map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionButton}
                    onPress={() => handleSend(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            matchMessages.map((message) => (
              <AIChatMessage
                key={message.id}
                message={message}
                matchId={match.id}
              />
            ))
          )}

          {isLoading && (
            <View style={styles.loadingMessage}>
              <LinearGradient
                colors={gradients.primary as [string, string]}
                style={styles.loadingAvatar}
              >
                <Ionicons name="sparkles" size={14} color={colors.white} />
              </LinearGradient>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.loadingText}>Analyse en cours...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <AIChatInput
          onSend={handleSend}
          isLoading={isLoading}
          tokensAvailable={tokenUsage?.remaining || 0}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageBar: {
    marginTop: spacing.sm,
  },
  usageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  usageText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  usageProgress: {
    height: 3,
    backgroundColor: colors.surface,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  usageProgressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 1.5,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    paddingHorizontal: spacing.lg,
  },
  suggestions: {
    width: '100%',
    marginTop: spacing.lg,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.white,
  },
  loadingMessage: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  loadingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});
