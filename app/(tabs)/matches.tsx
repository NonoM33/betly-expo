import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, isSameDay } from 'date-fns';
import { useMatchesStore, isMatchLive } from '../../src/stores/matchesStore';
import { MatchCard } from '../../src/components/match/MatchCard';
import { Badge } from '../../src/components/common/Badge';
import { ErrorState } from '../../src/components/common/ErrorState';
import { EmptyState } from '../../src/components/common/EmptyState';
import { MatchCardShimmer } from '../../src/components/common/Shimmer';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import type { MatchWithOdds } from '../../src/types';

export default function MatchesScreen() {
  const router = useRouter();

  const {
    matches,
    selectedDate,
    isLoading,
    isRefreshing,
    error,
    loadMatches,
    refreshMatches,
    loadLiveMatches,
    setSelectedDate,
    startLiveRefresh,
    stopLiveRefresh,
  } = useMatchesStore();

  const [showLiveOnly, setShowLiveOnly] = useState(false);

  useEffect(() => {
    loadMatches();
    loadLiveMatches();
    startLiveRefresh();
    return () => stopLiveRefresh();
  }, []);

  const handleRefresh = useCallback(() => {
    refreshMatches();
    loadLiveMatches();
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const groupedMatches = React.useMemo(() => {
    const filtered = showLiveOnly ? matches.filter((m) => isMatchLive(m.status)) : matches;
    const groups: Record<string, MatchWithOdds[]> = {};
    filtered.forEach((match) => {
      const key = match.league.name;
      if (!groups[key]) groups[key] = [];
      groups[key].push(match);
    });
    return Object.entries(groups).map(([league, matchList]) => ({
      league,
      matches: matchList,
    }));
  }, [matches, showLiveOnly]);

  const liveCount = matches.filter((m) => isMatchLive(m.status)).length;

  if (isLoading && matches.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header onSearchPress={() => router.push('/search')} />
        <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />
        <View style={styles.loadingContainer}>
          <MatchCardShimmer />
          <MatchCardShimmer />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onSearchPress={() => router.push('/search')} />
      <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />

      <View style={styles.filterTabs}>
        <Pressable style={[styles.filterTab, !showLiveOnly && styles.filterTabActive]} onPress={() => setShowLiveOnly(false)}>
          <Text style={[styles.filterTabText, !showLiveOnly && styles.filterTabTextActive]}>All</Text>
        </Pressable>
        <Pressable style={[styles.filterTab, showLiveOnly && styles.filterTabActive]} onPress={() => setShowLiveOnly(true)}>
          <View style={styles.liveTabContent}>
            {liveCount > 0 && <View style={styles.liveDot} />}
            <Text style={[styles.filterTabText, showLiveOnly && styles.filterTabTextActive]}>
              Live {liveCount > 0 ? `(${liveCount})` : ''}
            </Text>
          </View>
        </Pressable>
      </View>

      {error && matches.length === 0 ? (
        <ErrorState message={error} onRetry={loadMatches} />
      ) : matches.length === 0 ? (
        <EmptyState icon="football-outline" title="No matches" message={`No matches for ${format(selectedDate, 'MMMM d')}`} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.accentPrimary} />}
        >
          {groupedMatches.map((group) => (
            <View key={group.league} style={styles.leagueSection}>
              <View style={styles.leagueHeader}>
                <Text style={styles.leagueName}>{group.league}</Text>
                <Badge text={group.matches.length.toString()} variant="default" size="sm" />
              </View>
              {group.matches.map((match) => (
                <View key={match.id} style={styles.matchItem}>
                  <MatchCard match={match} />
                </View>
              ))}
            </View>
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const Header: React.FC<{ onSearchPress: () => void }> = ({ onSearchPress }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Matches</Text>
    <Pressable style={styles.iconButton} onPress={onSearchPress}>
      <Ionicons name="search" size={22} color={Colors.textPrimary} />
    </Pressable>
  </View>
);

const DateSelector: React.FC<{ selectedDate: Date; onDateChange: (date: Date) => void }> = ({ selectedDate, onDateChange }) => {
  const dates = React.useMemo(() => {
    const result = [];
    for (let i = -3; i <= 7; i++) result.push(addDays(new Date(), i));
    return result;
  }, []);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const index = dates.findIndex((d) => isSameDay(d, selectedDate));
    if (index !== -1 && scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollTo({ x: index * 72 - 100, animated: true }), 100);
    }
  }, [selectedDate]);

  return (
    <View style={styles.dateSelector}>
      <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateSelectorContent}>
        {dates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          return (
            <Pressable key={date.toISOString()} style={[styles.dateItem, isSelected && styles.dateItemSelected]} onPress={() => onDateChange(date)}>
              <Text style={[styles.dateDayName, isSelected && styles.dateTextSelected]}>{isToday ? 'Today' : format(date, 'EEE')}</Text>
              <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>{format(date, 'd')}</Text>
              <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>{format(date, 'MMM')}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  loadingContainer: { flex: 1, padding: Spacing.xl, gap: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dateSelector: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  dateSelectorContent: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.md },
  dateItem: { alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, minWidth: 64 },
  dateItemSelected: { backgroundColor: Colors.accentPrimary },
  dateDayName: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500', marginBottom: 2 },
  dateDay: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  dateMonth: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500', marginTop: 2 },
  dateTextSelected: { color: Colors.backgroundPrimary },
  filterTabs: { flexDirection: 'row', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.md },
  filterTab: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.full, backgroundColor: Colors.backgroundTertiary },
  filterTabActive: { backgroundColor: Colors.accentPrimary },
  filterTabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTabTextActive: { color: Colors.backgroundPrimary },
  liveTabContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.liveBadge },
  leagueSection: { marginBottom: Spacing['2xl'] },
  leagueHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  leagueName: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, flex: 1 },
  matchItem: { marginBottom: Spacing.lg },
  bottomPadding: { height: 100 },
});
