import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCreditsStore } from '../src/stores/creditsStore';
import { useAuthStore } from '../src/stores/authStore';
import { Card } from '../src/components/common/Card';
import { Badge } from '../src/components/common/Badge';
import { Button } from '../src/components/common/Button';
import { LoadingSpinner } from '../src/components/common/LoadingSpinner';
import { Colors, Spacing, BorderRadius, Gradients } from '../src/constants/theme';
import { format } from 'date-fns';
import type { CreditPack, CreditTransaction } from '../src/types';

export default function CreditsScreen() {
  const router = useRouter();
  const { balance, packs, transactions, isLoading, loadBalance, loadPacks, loadHistory } = useCreditsStore();
  const { isAuthenticated } = useAuthStore();
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadBalance();
      loadPacks();
      loadHistory();
    }
  }, [isAuthenticated]);

  const handlePurchase = async (pack: CreditPack) => {
    Alert.alert('Purchase Credits', `Buy ${pack.credits} credits for ${pack.price} ${pack.currency}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Buy', onPress: () => console.log('Purchase:', pack.id) },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header onClose={() => router.back()} />
        <View style={styles.notLoggedIn}>
          <Ionicons name="diamond" size={60} color={Colors.accentGold} />
          <Text style={styles.notLoggedInTitle}>Sign in to view credits</Text>
          <Button title="Sign In" onPress={() => router.push('/(auth)/login')} variant="primary" size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && !balance) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onClose={() => router.back()} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <LinearGradient colors={Gradients.premium} style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Ionicons name="diamond" size={28} color={Colors.backgroundPrimary} />
            <Text style={styles.balanceLabel}>Your Credits</Text>
          </View>
          <Text style={styles.balanceAmount}>{balance?.total ?? 0}</Text>
          <View style={styles.balanceBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{balance?.subscription ?? 0}</Text>
              <Text style={styles.breakdownLabel}>Subscription</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{balance?.purchased ?? 0}</Text>
              <Text style={styles.breakdownLabel}>Purchased</Text>
            </View>
          </View>
          {balance?.weeklyReset && (
            <Text style={styles.resetInfo}>Subscription credits reset {format(new Date(balance.weeklyReset), 'EEEE')}</Text>
          )}
        </LinearGradient>

        {/* Credit Packs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buy Credits</Text>
          <View style={styles.packsGrid}>
            {packs.map((pack) => (
              <CreditPackCard key={pack.id} pack={pack} onPress={() => handlePurchase(pack)} />
            ))}
          </View>
        </View>

        {/* Transaction History */}
        {transactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {transactions.slice(0, 10).map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const Header: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <View style={styles.header}>
    <Pressable style={styles.closeButton} onPress={onClose}>
      <Ionicons name="close" size={24} color={Colors.textPrimary} />
    </Pressable>
    <Text style={styles.headerTitle}>Credits</Text>
    <View style={styles.placeholder} />
  </View>
);

const CreditPackCard: React.FC<{ pack: CreditPack; onPress: () => void }> = ({ pack, onPress }) => (
  <Pressable style={[styles.packCard, pack.popular && styles.packCardPopular]} onPress={onPress}>
    {pack.popular && (
      <View style={styles.popularBadge}>
        <Text style={styles.popularText}>POPULAR</Text>
      </View>
    )}
    <Text style={styles.packCredits}>{pack.credits}</Text>
    <Text style={styles.packName}>{pack.name}</Text>
    {pack.bonus && pack.bonus > 0 && (
      <Badge text={`+${pack.bonus} bonus`} variant="success" size="sm" />
    )}
    <Text style={styles.packPrice}>{pack.currency === 'EUR' ? '€' : '$'}{pack.price.toFixed(2)}</Text>
  </Pressable>
);

const TransactionItem: React.FC<{ transaction: CreditTransaction }> = ({ transaction }) => {
  const isPositive = transaction.type === 'purchase' || transaction.type === 'reward' || transaction.type === 'subscription';
  const icon = {
    purchase: 'card-outline',
    spend: 'arrow-down-outline',
    refund: 'arrow-back-outline',
    reward: 'gift-outline',
    subscription: 'star-outline',
  }[transaction.type] as keyof typeof Ionicons.glyphMap;

  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIcon, { backgroundColor: isPositive ? `${Colors.success}20` : `${Colors.error}20` }]}>
        <Ionicons name={icon} size={18} color={isPositive ? Colors.success : Colors.error} />
      </View>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
        <Text style={styles.transactionDate}>{format(new Date(transaction.createdAt), 'MMM d, HH:mm')}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: isPositive ? Colors.success : Colors.error }]}>
        {isPositive ? '+' : '-'}{Math.abs(transaction.amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  content: { padding: Spacing.xl },
  notLoggedIn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl },
  notLoggedInTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  balanceCard: { borderRadius: BorderRadius.xl, padding: Spacing['2xl'], marginBottom: Spacing['2xl'] },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  balanceLabel: { fontSize: 14, fontWeight: '600', color: Colors.backgroundPrimary, opacity: 0.8 },
  balanceAmount: { fontSize: 56, fontWeight: '800', color: Colors.backgroundPrimary, marginBottom: Spacing.xl },
  balanceBreakdown: { flexDirection: 'row', alignItems: 'center' },
  breakdownItem: { flex: 1, alignItems: 'center' },
  breakdownValue: { fontSize: 20, fontWeight: '700', color: Colors.backgroundPrimary },
  breakdownLabel: { fontSize: 12, color: Colors.backgroundPrimary, opacity: 0.7, marginTop: 2 },
  breakdownDivider: { width: 1, height: 32, backgroundColor: 'rgba(0,0,0,0.2)' },
  resetInfo: { fontSize: 12, color: Colors.backgroundPrimary, opacity: 0.7, textAlign: 'center', marginTop: Spacing.xl },
  section: { marginBottom: Spacing['2xl'] },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.lg },
  packsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
  packCard: { width: '47%', backgroundColor: Colors.backgroundSecondary, borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  packCardPopular: { borderColor: Colors.accentGold, borderWidth: 2 },
  popularBadge: { position: 'absolute', top: -10, backgroundColor: Colors.accentGold, paddingHorizontal: Spacing.md, paddingVertical: 2, borderRadius: BorderRadius.sm },
  popularText: { fontSize: 9, fontWeight: '700', color: Colors.backgroundPrimary },
  packCredits: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  packName: { fontSize: 13, color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: Spacing.md },
  packPrice: { fontSize: 16, fontWeight: '700', color: Colors.accentGold, marginTop: Spacing.md },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  transactionIcon: { width: 36, height: 36, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg },
  transactionContent: { flex: 1 },
  transactionDescription: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  transactionDate: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  transactionAmount: { fontSize: 15, fontWeight: '700' },
  bottomPadding: { height: 40 },
});
