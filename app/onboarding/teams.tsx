import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Gradients, Spacing, BorderRadius } from '../../src/constants/theme';
import { useOnboardingStore, useAuthStore } from '../../src/stores';
import { TeamSelector } from '../../src/components/onboarding/TeamSelector';

// Sample leagues and teams data
const LEAGUES = [
  {
    id: 61,
    name: 'Ligue 1',
    teams: [
      { id: 85, name: 'Paris Saint-Germain', shortName: 'PSG' },
      { id: 81, name: 'Olympique Marseille', shortName: 'OM' },
      { id: 80, name: 'Olympique Lyonnais', shortName: 'OL' },
      { id: 91, name: 'AS Monaco', shortName: 'Monaco' },
      { id: 79, name: 'Lille OSC', shortName: 'LOSC' },
      { id: 94, name: 'Stade Rennais', shortName: 'Rennes' },
      { id: 93, name: 'Stade de Reims', shortName: 'Reims' },
      { id: 82, name: 'OGC Nice', shortName: 'Nice' },
    ],
  },
  {
    id: 39,
    name: 'Premier League',
    teams: [
      { id: 33, name: 'Manchester United', shortName: 'Man Utd' },
      { id: 40, name: 'Liverpool', shortName: 'Liverpool' },
      { id: 50, name: 'Manchester City', shortName: 'Man City' },
      { id: 42, name: 'Arsenal', shortName: 'Arsenal' },
      { id: 49, name: 'Chelsea', shortName: 'Chelsea' },
      { id: 47, name: 'Tottenham', shortName: 'Spurs' },
      { id: 66, name: 'Aston Villa', shortName: 'Villa' },
      { id: 34, name: 'Newcastle', shortName: 'Newcastle' },
    ],
  },
  {
    id: 140,
    name: 'La Liga',
    teams: [
      { id: 541, name: 'Real Madrid', shortName: 'Real' },
      { id: 529, name: 'FC Barcelona', shortName: 'Barça' },
      { id: 530, name: 'Atletico Madrid', shortName: 'Atlético' },
      { id: 536, name: 'Sevilla FC', shortName: 'Sevilla' },
    ],
  },
  {
    id: 135,
    name: 'Serie A',
    teams: [
      { id: 489, name: 'AC Milan', shortName: 'Milan' },
      { id: 505, name: 'Inter Milan', shortName: 'Inter' },
      { id: 496, name: 'Juventus', shortName: 'Juve' },
      { id: 497, name: 'AS Roma', shortName: 'Roma' },
    ],
  },
];

export default function TeamsOnboardingScreen() {
  const router = useRouter();
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const { setV2Completed } = useOnboardingStore();
  const { updateUser } = useAuthStore();

  const handleContinue = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Save favorite teams
    await setV2Completed(selectedTeams);

    // Update user preferences
    updateUser({
      preferences: {
        favoriteTeams: selectedTeams,
      },
    });

    // Navigate to main app
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await setV2Completed([]);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.subtitle}>Personnalisez votre feed</Text>
        <Text style={styles.title}>Choisissez vos équipes</Text>
        <Text style={styles.description}>
          Sélectionnez jusqu'à 5 équipes pour recevoir des prédictions personnalisées
        </Text>
      </View>

      {/* Team Selector */}
      <View style={styles.selectorContainer}>
        <TeamSelector
          leagues={LEAGUES}
          selectedTeams={selectedTeams}
          onSelectionChange={setSelectedTeams}
          maxSelection={5}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={selectedTeams.length === 0}
        >
          <LinearGradient
            colors={
              selectedTeams.length > 0
                ? Gradients.predictions
                : [Colors.backgroundTertiary, Colors.backgroundTertiary]
            }
            style={styles.continueGradient}
          >
            <Text
              style={[
                styles.continueText,
                selectedTeams.length === 0 && styles.continueTextDisabled,
              ]}
            >
              {selectedTeams.length > 0
                ? `Continuer avec ${selectedTeams.length} équipe${selectedTeams.length > 1 ? 's' : ''}`
                : 'Sélectionnez au moins une équipe'}
            </Text>
            {selectedTeams.length > 0 && (
              <Ionicons name="arrow-forward" size={20} color={Colors.backgroundPrimary} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  skipButton: {
    padding: Spacing.md,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  titleContainer: {
    paddingHorizontal: Spacing['3xl'],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.accentPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  selectorContainer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  continueButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.backgroundPrimary,
  },
  continueTextDisabled: {
    color: Colors.textMuted,
  },
});
