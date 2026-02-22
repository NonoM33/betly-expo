import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../src/utils/haptics';
import { Colors, Gradients, Spacing, BorderRadius } from '../../src/constants/theme';
import { useOnboardingStore } from '../../src/stores';
import { OnboardingSlide } from '../../src/components/onboarding/OnboardingSlide';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'sparkles' as const,
    title: 'Paris Sportifs Intelligents',
    subtitle: 'Betly',
    description:
      "L'IA qui te dit sur quoi parier et pourquoi. Analyse statistique avancée et prédictions personnalisées.",
  },
  {
    icon: 'analytics' as const,
    title: 'Analyses IA Expert',
    subtitle: 'Technologie',
    description:
      'Notre IA analyse des milliers de données pour chaque match : statistiques, forme des équipes, historique des confrontations.',
  },
  {
    icon: 'trophy' as const,
    title: 'Suivi de Performance',
    subtitle: 'Progression',
    description:
      'Suivez vos paris, analysez vos résultats et améliorez votre stratégie avec des statistiques détaillées.',
  },
  {
    icon: 'flame' as const,
    title: 'Gamification',
    subtitle: 'Motivation',
    description:
      'Gagnez des XP, débloquez des badges et maintenez votre série pour rester motivé et progresser.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setIntroSeen } = useOnboardingStore();

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setIntroSeen();
    router.replace('/onboarding/teams');
  };

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, index) => (
          <OnboardingSlide key={index} {...slide} />
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Next button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient
            colors={Gradients.predictions}
            style={styles.nextGradient}
          >
            <Text style={styles.nextText}>
              {currentIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.backgroundPrimary} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.backgroundTertiary,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.accentPrimary,
    width: 24,
  },
  footer: {
    paddingHorizontal: Spacing['3xl'],
    paddingBottom: Spacing['4xl'],
  },
  nextButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: 8,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.backgroundPrimary,
  },
});
