import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { Colors, Spacing, BorderRadius, Gradients } from '../../src/constants/theme';
import { Config } from '../../src/constants/config';

// Configure Google Sign-In
GoogleSignin.configure({
  iosClientId: Config.GOOGLE_CLIENT_ID_IOS,
  webClientId: Config.GOOGLE_CLIENT_ID_WEB,
});

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithGoogle, loginWithApple, isLoading, error, clearError } = useAuthStore();
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [isSigningInApple, setIsSigningInApple] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningInGoogle(true);
      clearError();

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (idToken) {
        await loginWithGoogle(idToken);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      Alert.alert('Sign In Failed', error.message || 'Could not sign in with Google');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsSigningInApple(true);
      clearError();

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken && credential.authorizationCode) {
        await loginWithApple(credential.identityToken, credential.authorizationCode, {
          email: credential.email,
          fullName: {
            givenName: credential.fullName?.givenName,
            familyName: credential.fullName?.familyName,
          },
        });
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        console.error('Apple sign-in error:', error);
        Alert.alert('Sign In Failed', error.message || 'Could not sign in with Apple');
      }
    } finally {
      setIsSigningInApple(false);
    }
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
          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={BorderRadius.md}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          <Button
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            variant="outline"
            size="xl"
            fullWidth
            loading={isSigningInGoogle}
            icon={<Ionicons name="logo-google" size={20} color={Colors.textPrimary} />}
          />
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
          variant="ghost"
          size="md"
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
  content: { flex: 1, paddingHorizontal: Spacing['3xl'], justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: Spacing['4xl'] },
  logoContainer: { width: 80, height: 80, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  subtitle: { fontSize: 16, color: Colors.textSecondary },
  features: { marginBottom: Spacing['4xl'] },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  featureIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: `${Colors.accentPrimary}20`, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg },
  featureText: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  signInSection: { gap: Spacing.lg, marginBottom: Spacing['2xl'] },
  appleButton: { height: 56, width: '100%' },
  terms: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center', lineHeight: 18 },
  link: { color: Colors.accentPrimary },
  skipButton: { marginTop: Spacing.xl, alignSelf: 'center' },
});
