import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../src/components/common/Card';
import { Badge } from '../src/components/common/Badge';
import { Button } from '../src/components/common/Button';
import { Colors, Spacing, BorderRadius, Gradients } from '../src/constants/theme';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    features: ['5 predictions/week', 'Basic match stats', 'Daily tips (limited)'],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    period: 'month',
    features: ['25 predictions/week', 'Full match stats', 'All daily tips', 'Value bets', 'Email support'],
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 19.99,
    period: 'month',
    features: ['Unlimited predictions', 'AI Chat Expert', 'Priority support', 'Early access', 'Exclusive insights'],
    popular: false,
  },
  {
    id: 'expert',
    name: 'Expert',
    price: 49.99,
    period: 'month',
    features: ['Everything in VIP', '1-on-1 consultations', 'Custom strategies', 'API access', 'Dedicated manager'],
    popular: false,
  },
];

export default function PricingScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    if (planId === 'free') {
      router.back();
      return;
    }
    Alert.alert('Subscribe', `Subscribe to ${planId.toUpperCase()} plan?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Subscribe', onPress: () => console.log('Subscribe to:', planId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Unlock AI-Powered Predictions</Text>
          <Text style={styles.introSubtitle}>Get access to our most accurate predictions and expert analysis</Text>
        </View>

        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
            onSelect={() => setSelectedPlan(plan.id)}
            onSubscribe={() => handleSubscribe(plan.id)}
          />
        ))}

        <Text style={styles.terms}>
          Cancel anytime. All prices in EUR. {'\n'}
          By subscribing you agree to our Terms of Service.
        </Text>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PlanCard: React.FC<{
  plan: typeof plans[0];
  isSelected: boolean;
  onSelect: () => void;
  onSubscribe: () => void;
}> = ({ plan, isSelected, onSelect, onSubscribe }) => {
  const isPaid = plan.price > 0;
  const gradientColors = plan.id === 'expert' ? Gradients.vip : plan.id === 'vip' ? Gradients.aiSubtle : Gradients.premium;

  return (
    <Pressable onPress={onSelect}>
      <Card
        variant={plan.popular ? 'gradient' : 'default'}
        gradientColors={plan.popular ? gradientColors : undefined}
        padding="lg"
        style={[styles.planCard, isSelected && styles.planCardSelected]}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={[styles.planName, plan.popular && styles.planNamePopular]}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            {isPaid && <Text style={[styles.priceCurrency, plan.popular && styles.pricePopular]}>€</Text>}
            <Text style={[styles.planPrice, plan.popular && styles.pricePopular]}>
              {isPaid ? (plan.price ?? 0).toFixed(2) : 'Free'}
            </Text>
            {isPaid && <Text style={[styles.pricePeriod, plan.popular && styles.pricePopular]}>/{plan.period}</Text>}
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={plan.popular ? Colors.backgroundPrimary : Colors.accentPrimary}
              />
              <Text style={[styles.featureText, plan.popular && styles.featureTextPopular]}>{feature}</Text>
            </View>
          ))}
        </View>

        <Button
          title={isPaid ? 'Subscribe' : 'Continue Free'}
          onPress={onSubscribe}
          variant={plan.popular ? 'secondary' : isPaid ? 'gradient' : 'outline'}
          size="lg"
          fullWidth
          gradientColors={!plan.popular && isPaid ? gradientColors : undefined}
        />
      </Card>
    </Pressable>
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
  intro: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  introTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  introSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md, lineHeight: 22 },
  planCard: { marginBottom: Spacing.xl, position: 'relative' },
  planCardSelected: { borderColor: Colors.accentPrimary, borderWidth: 2 },
  popularBadge: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: Colors.accentPrimary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  popularText: { fontSize: 10, fontWeight: '700', color: Colors.backgroundPrimary, letterSpacing: 0.5 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  planName: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  planNamePopular: { color: Colors.backgroundPrimary },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline' },
  priceCurrency: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  planPrice: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  pricePeriod: { fontSize: 14, color: Colors.textSecondary, marginLeft: 2 },
  pricePopular: { color: Colors.backgroundPrimary },
  featuresContainer: { marginBottom: Spacing.xl },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  featureText: { fontSize: 14, color: Colors.textSecondary },
  featureTextPopular: { color: Colors.backgroundPrimary, opacity: 0.9 },
  terms: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center', lineHeight: 18, marginTop: Spacing.xl },
  bottomPadding: { height: 40 },
});
