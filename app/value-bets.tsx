import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Gradients, Spacing, BorderRadius } from '../src/constants/theme';
import { valueBetsService } from '../src/api/services';
import type { ValueBet } from '../src/types';
import { useCreditsStore, useAuthStore } from '../src/stores';

export default function ValueBetsScreen() {
  const router = useRouter();
  const [valueBets, setValueBets] = useState<ValueBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isVip } = useAuthStore();

  useEffect(() => {
    loadValueBets();
  }, []);

  const loadValueBets = async () => {
    try {
      setIsLoading(true);
      const data = await valueBetsService.getValueBets();
      setValueBets(data);
    } catch (error) {
      console.error('Failed to load value bets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadValueBets();
    setIsRefreshing(false);
  };

  const handleMatchPress = (matchId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/match/${matchId}`);
  };

  const renderValueBet = ({ item }: { item: ValueBet }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleMatchPress(item.matchId)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.valueBadge}>
          <Ionicons name="trending-up" size={14} color={Colors.textPrimary} />
          <Text style={styles.valueText}>+{(item.value * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>{item.confidence}%</Text>
        </View>
      </View>

      <View style={styles.matchInfo}>
        <Text style={styles.matchTitle} numberOfLines={1}>
          {item.match.homeTeam.name} vs {item.match.awayTeam.name}
        </Text>
        <Text style={styles.betType}>{item.bet}</Text>
      </View>

      <View style={styles.oddsRow}>
        <View style={styles.oddsItem}>
          <Text style={styles.oddsLabel}>Cote bookmaker</Text>
          <Text style={styles.oddsValue}>{item.bookmakerOdds.toFixed(2)}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
        <View style={styles.oddsItem}>
          <Text style={styles.oddsLabel}>Vraie cote</Text>
          <Text style={styles.trueOddsValue}>{item.trueOdds.toFixed(2)}</Text>
        </View>
      </View>

      {!item.isUnlocked && (
        <View style={styles.lockedOverlay}>
          <Ionicons name="lock-closed" size={16} color={Colors.textMuted} />
          <Text style={styles.lockedText}>Réservé aux VIP</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Value Bets',
          headerStyle: { backgroundColor: Colors.backgroundPrimary },
          headerTintColor: Colors.textPrimary,
        }}
      />

      {/* Header info */}
      <View style={styles.header}>
        <LinearGradient
          colors={Gradients.valueBets}
          style={styles.headerGradient}
        >
          <Ionicons name="diamond" size={24} color={Colors.textPrimary} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Value Bets Premium</Text>
            <Text style={styles.headerSubtitle}>
              Paris avec avantage statistique
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* VIP gate */}
      {!isVip() && (
        <View style={styles.vipGate}>
          <Ionicons name="lock-closed" size={32} color={Colors.accentGold} />
          <Text style={styles.vipTitle}>Fonctionnalité VIP</Text>
          <Text style={styles.vipText}>
            Les Value Bets sont réservés aux abonnés VIP et Expert
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/pricing')}
          >
            <LinearGradient
              colors={Gradients.premium}
              style={styles.upgradeGradient}
            >
              <Text style={styles.upgradeText}>Passer VIP</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {isVip() && (
        <>
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={Colors.accentPrimary} />
            </View>
          ) : (
            <FlatList
              data={valueBets}
              renderItem={renderValueBet}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={Colors.accentPrimary}
                />
              }
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="search" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyTitle}>Aucun Value Bet</Text>
                  <Text style={styles.emptyText}>
                    Revenez plus tard pour découvrir de nouvelles opportunités
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  header: {
    padding: Spacing.xl,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  list: {
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  valueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.info,
  },
  confidenceBadge: {
    backgroundColor: 'rgba(0, 209, 102, 0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accentPrimary,
  },
  matchInfo: {
    marginBottom: Spacing.lg,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  betType: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  oddsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  oddsItem: {
    alignItems: 'center',
  },
  oddsLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  oddsValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  trueOddsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accentPrimary,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 13, 13, 0.9)',
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  lockedText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  vipGate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['4xl'],
  },
  vipTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.accentGold,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  vipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
  },
  upgradeButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  upgradeGradient: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing['4xl'],
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.backgroundPrimary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing['6xl'],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
