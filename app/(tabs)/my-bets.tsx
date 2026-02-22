import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { EmptyState } from '../../src/components/common/EmptyState';
import { TeamLogo } from '../../src/components/common/TeamLogo';
import { Colors, Spacing, BorderRadius, Gradients } from '../../src/constants/theme';
import { ticketsService, portfolioService } from '../../src/api/services';
import type { Ticket, Portfolio } from '../../src/types';
import { format } from 'date-fns';

export default function MyBetsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [ticketsData, portfolioData] = await Promise.all([
        ticketsService.getTickets(),
        portfolioService.getPortfolio(),
      ]);
      setTickets(ticketsData);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Failed to load bets data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const handleRefresh = useCallback(() => { setIsRefreshing(true); loadData(); }, [loadData]);

  const activeTickets = tickets.filter((t) => t.status === 'pending');
  const historyTickets = tickets.filter((t) => t.status !== 'pending');
  const displayedTickets = activeTab === 'active' ? activeTickets : historyTickets;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bets</Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="stats-chart" size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.accentPrimary} />}>

        {portfolio && <PortfolioCard portfolio={portfolio} />}

        <View style={styles.tabs}>
          <Pressable style={[styles.tab, activeTab === 'active' && styles.tabActive]} onPress={() => setActiveTab('active')}>
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Active</Text>
            {activeTickets.length > 0 && <Badge text={activeTickets.length.toString()} variant="success" size="sm" />}
          </Pressable>
          <Pressable style={[styles.tab, activeTab === 'history' && styles.tabActive]} onPress={() => setActiveTab('history')}>
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
          </Pressable>
        </View>

        {displayedTickets.length === 0 ? (
          <EmptyState
            icon={activeTab === 'active' ? 'receipt-outline' : 'time-outline'}
            title={activeTab === 'active' ? 'No active bets' : 'No bet history'}
            message={activeTab === 'active' ? 'Start tracking your bets' : 'Completed bets appear here'}
            actionTitle={activeTab === 'active' ? 'Browse Matches' : undefined}
            onAction={activeTab === 'active' ? () => router.push('/matches') : undefined}
          />
        ) : (
          displayedTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PortfolioCard: React.FC<{ portfolio: Portfolio }> = ({ portfolio }) => (
  <Card variant="gradient" gradientColors={Gradients.predictions} padding="lg">
    <View style={styles.portfolioHeader}>
      <Text style={styles.portfolioTitle}>Your Performance</Text>
      <Badge text={(portfolio.profit ?? 0) >= 0 ? 'Profitable' : 'Learning'} variant={(portfolio.profit ?? 0) >= 0 ? 'success' : 'warning'} size="sm" />
    </View>
    <View style={styles.portfolioStats}>
      <Text style={styles.portfolioMainValue}>{(portfolio.profit ?? 0) >= 0 ? '+' : ''}{((portfolio.profit ?? 0) * 100).toFixed(1)}%</Text>
      <Text style={styles.portfolioMainLabel}>Total ROI</Text>
    </View>
    <View style={styles.portfolioGrid}>
      <PortfolioStatItem label="Win Rate" value={`${((portfolio.winRate ?? 0) * 100).toFixed(0)}%`} />
      <PortfolioStatItem label="Total" value={portfolio.totalBets.toString()} />
      <PortfolioStatItem label="Won" value={portfolio.wonBets.toString()} color={Colors.success} />
      <PortfolioStatItem label="Lost" value={portfolio.lostBets.toString()} color={Colors.error} />
    </View>
  </Card>
);

const PortfolioStatItem: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <View style={styles.portfolioStatItem}>
    <Text style={[styles.portfolioStatValue, color && { color }]}>{value}</Text>
    <Text style={styles.portfolioStatLabel}>{label}</Text>
  </View>
);

const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const statusColor = { pending: Colors.warning, won: Colors.success, lost: Colors.error, void: Colors.textTertiary }[ticket.status];
  const statusIcon = { pending: 'time-outline', won: 'checkmark-circle', lost: 'close-circle', void: 'remove-circle-outline' }[ticket.status] as keyof typeof Ionicons.glyphMap;

  return (
    <Card variant="default" padding="md" style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <View>
          <Text style={styles.ticketDate}>{format(new Date(ticket.createdAt), 'MMM d, HH:mm')}</Text>
          <Text style={styles.ticketSelections}>{ticket.selections.length} selection{ticket.selections.length > 1 ? 's' : ''}</Text>
        </View>
        <View style={[styles.ticketStatus, { backgroundColor: `${statusColor}20` }]}>
          <Ionicons name={statusIcon} size={14} color={statusColor} />
          <Text style={[styles.ticketStatusText, { color: statusColor }]}>{ticket.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.ticketFooter}>
        <View style={styles.ticketFooterItem}><Text style={styles.ticketFooterLabel}>Odds</Text><Text style={styles.ticketFooterValue}>{(ticket.totalOdds ?? 0).toFixed(2)}</Text></View>
        <View style={styles.ticketFooterItem}><Text style={styles.ticketFooterLabel}>Stake</Text><Text style={styles.ticketFooterValue}>€{(ticket.stake ?? 0).toFixed(2)}</Text></View>
        <View style={styles.ticketFooterItem}><Text style={styles.ticketFooterLabel}>Potential</Text><Text style={[styles.ticketFooterValue, styles.ticketPotential]}>€{(ticket.potentialWin ?? 0).toFixed(2)}</Text></View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  portfolioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  portfolioTitle: { fontSize: 14, fontWeight: '600', color: Colors.backgroundPrimary, opacity: 0.8 },
  portfolioStats: { alignItems: 'center', marginBottom: Spacing.xl },
  portfolioMainValue: { fontSize: 40, fontWeight: '800', color: Colors.backgroundPrimary },
  portfolioMainLabel: { fontSize: 13, color: Colors.backgroundPrimary, opacity: 0.7 },
  portfolioGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  portfolioStatItem: { alignItems: 'center' },
  portfolioStatValue: { fontSize: 18, fontWeight: '700', color: Colors.backgroundPrimary },
  portfolioStatLabel: { fontSize: 11, color: Colors.backgroundPrimary, opacity: 0.7, marginTop: 2 },
  tabs: { flexDirection: 'row', marginTop: Spacing['2xl'], marginBottom: Spacing.xl, gap: Spacing.md },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderRadius: BorderRadius.full, backgroundColor: Colors.backgroundTertiary, gap: Spacing.md },
  tabActive: { backgroundColor: Colors.accentPrimary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.backgroundPrimary },
  ticketCard: { marginBottom: Spacing.lg },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  ticketDate: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  ticketSelections: { fontSize: 12, color: Colors.textTertiary },
  ticketStatus: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  ticketStatusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
  ticketFooterItem: { alignItems: 'center', gap: Spacing.xs },
  ticketFooterLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500' },
  ticketFooterValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  ticketPotential: { color: Colors.accentPrimary },
  bottomPadding: { height: 100 },
});
