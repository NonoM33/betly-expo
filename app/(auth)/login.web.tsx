import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../src/components/common/Button';
import { Colors, Spacing, BorderRadius, Gradients } from '../../src/constants/theme';

/**
 * Web-specific login screen
 * Native auth (Google/Apple Sign-In) is not supported on web
 * Users can continue as guest or implement OAuth redirect flow
 */
export default function LoginScreen() {
  const router = useRouter();

  const handleGoogleSignIn = () => {
    // TODO: Implement OAuth redirect flow for web
    window.alert('Google Sign-In is not yet available on web. Please use the mobile app or continue as guest.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo & Header */}
        <View style={styles.header}>
          <LinearGradient colors={Gradients.predictions} style={styles.logoContainer}>
            <Ionicons name="football" size={40} color={Colors.backgroundPrimary} />
          </LinearGradient>
          <Text style={styles.title}>Welcome to Betly</Text>
          <Text style={styles.subtitle}>AI-powered sports predictions</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem icon="analytics" text="Smart AI predictions" />
          <FeatureItem icon="trending-up" text="Track your performance" />
          <FeatureItem icon="notifications" text="Real-time alerts" />
        </View>

        {/* Sign In Buttons */}
        <View style={styles.signInSection}>
          <Button
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            variant="outline"
            size="xl"
            fullWidth
            icon={<Ionicons name="logo-google" size={20} color={Colors.textPrimary} />}
          />

          <Text style={styles.webNotice}>
            Full authentication is available in the mobile app
          </Text>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>

        {/* Skip for now */}
        <Button
          title="Continue as Guest"
          onPress={() => router.replace('/(tabs)')}
          variant="gradient"
          gradientColors={Gradients.predictions}
          size="lg"
          fullWidth
          style={styles.skipButton}
        />
      </View>
    </SafeAreaView>
  );
}

const FeatureItem: React.FC<{ icon: keyof typeof Ionicons.glyphMap; text: string }> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Ionicons name={icon} size={20} color={Colors.accentPrimary} />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  content: { flex: 1, paddingHorizontal: Spacing['3xl'], justifyContent: 'center', maxWidth: 400, alignSelf: 'center', width: '100%' },
  header: { alignItems: 'center', marginBottom: Spacing['4xl'] },
  logoContainer: { width: 80, height: 80, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  subtitle: { fontSize: 16, color: Colors.textSecondary },
  features: { marginBottom: Spacing['4xl'] },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  featureIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: `${Colors.accentPrimary}20`, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg },
  featureText: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  signInSection: { gap: Spacing.lg, marginBottom: Spacing['2xl'] },
  webNotice: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center', fontStyle: 'italic' },
  terms: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center', lineHeight: 18 },
  link: { color: Colors.accentPrimary },
  skipButton: { marginTop: Spacing.xl },
});
