import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../src/components/common/Card';
import { Colors, Spacing, BorderRadius } from '../src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    dailyTips: true,
    matchReminders: true,
    liveUpdates: false,
    promotions: false,
  });

  const toggleSetting = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card variant="default" padding="none">
            <SettingToggle label="Daily Tips" description="Get notified about new tips" value={notifications.dailyTips} onToggle={() => toggleSetting('dailyTips')} />
            <SettingToggle label="Match Reminders" description="Reminders before matches start" value={notifications.matchReminders} onToggle={() => toggleSetting('matchReminders')} />
            <SettingToggle label="Live Updates" description="Real-time score updates" value={notifications.liveUpdates} onToggle={() => toggleSetting('liveUpdates')} />
            <SettingToggle label="Promotions" description="Special offers and discounts" value={notifications.promotions} onToggle={() => toggleSetting('promotions')} isLast />
          </Card>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <Card variant="default" padding="none">
            <SettingLink icon="language" label="Language" value="English" onPress={() => {}} />
            <SettingLink icon="moon" label="Appearance" value="Dark" onPress={() => {}} />
            <SettingLink icon="globe" label="Region" value="France" onPress={() => {}} isLast />
          </Card>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card variant="default" padding="none">
            <SettingLink icon="help-circle" label="FAQ" onPress={() => Linking.openURL('https://betly.fr/faq')} />
            <SettingLink icon="mail" label="Contact Us" onPress={() => Linking.openURL('mailto:support@betly.fr')} />
            <SettingLink icon="chatbubbles" label="Live Chat" onPress={() => {}} isLast />
          </Card>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Card variant="default" padding="none">
            <SettingLink icon="document-text" label="Terms of Service" onPress={() => Linking.openURL('https://betly.fr/terms')} />
            <SettingLink icon="shield" label="Privacy Policy" onPress={() => Linking.openURL('https://betly.fr/privacy')} />
            <SettingLink icon="information-circle" label="Licenses" onPress={() => {}} isLast />
          </Card>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingToggle: React.FC<{ label: string; description: string; value: boolean; onToggle: () => void; isLast?: boolean }> = ({ label, description, value, onToggle, isLast }) => (
  <View style={[styles.settingItem, !isLast && styles.settingItemBorder]}>
    <View style={styles.settingContent}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingDescription}>{description}</Text>
    </View>
    <Switch value={value} onValueChange={onToggle} trackColor={{ false: Colors.backgroundTertiary, true: Colors.accentPrimary }} thumbColor={Colors.textPrimary} />
  </View>
);

const SettingLink: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; onPress: () => void; isLast?: boolean }> = ({ icon, label, value, onPress, isLast }) => (
  <Pressable style={[styles.settingItem, !isLast && styles.settingItemBorder]} onPress={onPress}>
    <View style={styles.settingIcon}>
      <Ionicons name={icon} size={20} color={Colors.textSecondary} />
    </View>
    <Text style={styles.settingLabel}>{label}</Text>
    <View style={styles.settingRight}>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  content: { padding: Spacing.xl },
  section: { marginBottom: Spacing['2xl'] },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.lg },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
  settingItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingIcon: { width: 32, height: 32, borderRadius: BorderRadius.sm, backgroundColor: Colors.backgroundTertiary, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary, flex: 1 },
  settingDescription: { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  settingValue: { fontSize: 14, color: Colors.textTertiary },
  bottomPadding: { height: 40 },
});
