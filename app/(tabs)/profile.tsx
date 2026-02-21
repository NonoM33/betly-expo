import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { useAuthStore } from '../../src/stores/authStore';
import { useCreditsStore } from '../../src/stores/creditsStore';
import { Colors, Spacing, BorderRadius, Gradients, AvatarSize } from '../../src/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasSubscription, getSubscriptionTier } = useAuthStore();
  const { balance, loadBalance } = useCreditsStore();

  useEffect(() => { if (isAuthenticated) loadBalance(); }, [isAuthenticated]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notLoggedIn}>
          <Ionicons name="person-circle-outline" size={80} color={Colors.textTertiary} />
          <Text style={styles.notLoggedInTitle}>Sign in to access your profile</Text>
          <Text style={styles.notLoggedInSubtitle}>Track bets, manage subscriptions, and more</Text>
          <Button title="Sign In" onPress={() => router.push('/(auth)/login')} variant="primary" size="lg" style={styles.signInButton} />
        </View>
      </SafeAreaView>
    );
  }

  const subscriptionTier = getSubscriptionTier();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.photoUrl ? (
              <Image source={{ uri: user.photoUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}><Ionicons name="person" size={40} color={Colors.textTertiary} /></View>
            )}
            {hasSubscription() && (
              <View style={styles.subscriptionBadge}>
                <LinearGradient colors={subscriptionTier === 'expert' ? Gradients.vip : Gradients.premium} style={styles.subscriptionBadgeGradient}>
                  <Ionicons name="star" size={10} color={Colors.backgroundPrimary} />
                </LinearGradient>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user.displayName || 'Bettor'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.subscriptionContainer}>
            <Badge text={subscriptionTier.toUpperCase()} variant={subscriptionTier === 'free' ? 'default' : 'gradient'} gradientColors={subscriptionTier === 'expert' ? Gradients.vip : Gradients.premium} size="md" />
            {subscriptionTier === 'free' && <Button title="Upgrade" onPress={() => router.push('/pricing')} variant="gradient" size="sm" gradientColors={Gradients.premium} />}
          </View>
        </View>

        <Card variant="gradient" gradientColors={Gradients.premium} padding="lg" onPress={() => router.push('/credits')} style={styles.creditsCard}>
          <View style={styles.creditsHeader}>
            <View style={styles.creditsInfo}><Ionicons name="diamond" size={24} color={Colors.backgroundPrimary} /><Text style={styles.creditsLabel}>Credits</Text></View>
            <Ionicons name="chevron-forward" size={20} color={Colors.backgroundPrimary} />
          </View>
          <Text style={styles.creditsAmount}>{balance?.total ?? 0}</Text>
          <Text style={styles.creditsBreakdownText}>{balance?.subscription ?? 0} subscription • {balance?.purchased ?? 0} purchased</Text>
        </Card>

        <GamificationCard />

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <MenuItem icon="receipt-outline" title="My Bets" subtitle="View betting history" onPress={() => router.push('/(tabs)/my-bets')} />
          <MenuItem icon="card-outline" title="Subscription" subtitle="Manage your plan" onPress={() => router.push('/pricing')} />
          <MenuItem icon="people-outline" title="Referrals" subtitle="Invite friends" onPress={() => {}} />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Settings</Text>
          <MenuItem icon="notifications-outline" title="Notifications" subtitle="Configure alerts" onPress={() => router.push('/settings')} />
          <MenuItem icon="shield-outline" title="Privacy" subtitle="Data settings" onPress={() => {}} />
          <MenuItem icon="help-circle-outline" title="Help" subtitle="FAQ & support" onPress={() => {}} />
        </View>

        <Button title="Sign Out" onPress={handleLogout} variant="outline" size="lg" style={styles.signOutButton} icon={<Ionicons name="log-out-outline" size={20} color={Colors.textPrimary} />} />

        <View style={styles.appInfo}><Text style={styles.appVersion}>Betly v1.2.0 (26)</Text></View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const GamificationCard: React.FC = () => (
  <Card variant="default" padding="lg" style={styles.gamificationCard}>
    <View style={styles.gamificationHeader}>
      <View style={styles.gamificationLevel}>
        <LinearGradient colors={Gradients.vip} style={styles.levelBadge}><Text style={styles.levelNumber}>5</Text></LinearGradient>
        <View><Text style={styles.levelTitle}>Level 5</Text><Text style={styles.levelSubtitle}>Rising Star</Text></View>
      </View>
      <View><Text style={styles.xpText}>2,450 XP</Text><Text style={styles.xpToNext}>550 to next</Text></View>
    </View>
    <View style={styles.xpProgressContainer}>
      <View style={styles.xpProgressTrack}>
        <LinearGradient colors={Gradients.vip} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.xpProgressFill, { width: '82%' }]} />
      </View>
    </View>
    <View style={styles.streakContainer}>
      <View style={styles.streakItem}><Ionicons name="flame" size={20} color={Colors.gradientOrange} /><Text style={styles.streakValue}>7</Text><Text style={styles.streakLabel}>Day Streak</Text></View>
      <View style={styles.streakDivider} />
      <View style={styles.streakItem}><Ionicons name="trophy" size={20} color={Colors.accentGold} /><Text style={styles.streakValue}>14</Text><Text style={styles.streakLabel}>Best Streak</Text></View>
    </View>
  </Card>
);

const MenuItem: React.FC<{ icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; onPress: () => void }> = ({ icon, title, subtitle, onPress }) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemIcon}><Ionicons name={icon} size={22} color={Colors.textSecondary} /></View>
    <View style={styles.menuItemContent}><Text style={styles.menuItemTitle}>{title}</Text><Text style={styles.menuItemSubtitle}>{subtitle}</Text></View>
    <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing['2xl'] },
  notLoggedIn: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'] },
  notLoggedInTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginTop: Spacing.xl },
  notLoggedInSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md },
  signInButton: { marginTop: Spacing['2xl'], minWidth: 200 },
  profileHeader: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  avatarContainer: { position: 'relative', marginBottom: Spacing.lg },
  avatar: { width: AvatarSize.xl, height: AvatarSize.xl, borderRadius: AvatarSize.xl / 2 },
  avatarPlaceholder: { width: AvatarSize.xl, height: AvatarSize.xl, borderRadius: AvatarSize.xl / 2, backgroundColor: Colors.backgroundTertiary, alignItems: 'center', justifyContent: 'center' },
  subscriptionBadge: { position: 'absolute', bottom: 0, right: 0 },
  subscriptionBadgeGradient: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.backgroundPrimary },
  userName: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  userEmail: { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.sm },
  subscriptionContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginTop: Spacing.lg },
  creditsCard: { marginBottom: Spacing['2xl'] },
  creditsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  creditsInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  creditsLabel: { fontSize: 14, fontWeight: '600', color: Colors.backgroundPrimary, opacity: 0.8 },
  creditsAmount: { fontSize: 40, fontWeight: '800', color: Colors.backgroundPrimary, marginTop: Spacing.md },
  creditsBreakdownText: { fontSize: 13, color: Colors.backgroundPrimary, opacity: 0.7, marginTop: Spacing.sm },
  gamificationCard: { marginBottom: Spacing['2xl'] },
  gamificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gamificationLevel: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  levelBadge: { width: 48, height: 48, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  levelNumber: { fontSize: 20, fontWeight: '800', color: Colors.backgroundPrimary },
  levelTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  levelSubtitle: { fontSize: 12, color: Colors.textSecondary },
  xpText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  xpToNext: { fontSize: 11, color: Colors.textTertiary, marginTop: 2, textAlign: 'right' },
  xpProgressContainer: { marginTop: Spacing.xl },
  xpProgressTrack: { height: 6, backgroundColor: Colors.backgroundTertiary, borderRadius: BorderRadius.full, overflow: 'hidden' },
  xpProgressFill: { height: '100%', borderRadius: BorderRadius.full },
  streakContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xl, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
  streakItem: { flex: 1, alignItems: 'center', gap: Spacing.sm },
  streakValue: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  streakLabel: { fontSize: 11, color: Colors.textTertiary },
  streakDivider: { width: 1, height: 48, backgroundColor: Colors.border },
  menuSection: { marginBottom: Spacing['2xl'] },
  menuSectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuItemIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: Colors.backgroundTertiary, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg },
  menuItemContent: { flex: 1 },
  menuItemTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  menuItemSubtitle: { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },
  signOutButton: { marginTop: Spacing.xl },
  appInfo: { alignItems: 'center', marginTop: Spacing['2xl'], paddingTop: Spacing['2xl'], borderTopWidth: 1, borderTopColor: Colors.border },
  appVersion: { fontSize: 13, color: Colors.textTertiary },
  bottomPadding: { height: 100 },
});
