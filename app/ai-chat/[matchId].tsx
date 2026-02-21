import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAIChatStore, formatTokenCount } from '../../src/stores/aiChatStore';
import { useAuthStore } from '../../src/stores/authStore';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';
import { Colors, Spacing, BorderRadius, Gradients } from '../../src/constants/theme';
import { format } from 'date-fns';
import type { AIChatMessage } from '../../src/types';

export default function AIChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const matchIdNum = parseInt(matchId || '0', 10);

  const { messages, tokenUsage, isLoading, isSending, error, loadUsage, loadHistory, sendMessage, setCurrentMatch, clearError } = useAIChatStore();
  const { isVip, isExpert } = useAuthStore();
  const [inputText, setInputText] = useState('');

  const chatMessages = messages[matchIdNum] || [];

  useEffect(() => {
    setCurrentMatch(matchIdNum);
    loadUsage();
    loadHistory(matchIdNum);

    return () => setCurrentMatch(null);
  }, [matchIdNum]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatMessages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const message = inputText.trim();
    setInputText('');

    try {
      await sendMessage(matchIdNum, message);
    } catch (err: any) {
      if (err.code === 'EXPERT_REQUIRED') {
        Alert.alert('Expert Required', 'AI Chat requires VIP or Expert subscription.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/pricing') },
        ]);
      } else {
        Alert.alert('Error', err.message || 'Failed to send message');
      }
    }
  };

  if (!isVip() && !isExpert()) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header onClose={() => router.back()} matchId={matchIdNum} />
        <View style={styles.lockedContainer}>
          <LinearGradient colors={Gradients.vip} style={styles.lockIcon}>
            <Ionicons name="chatbubbles" size={40} color={Colors.backgroundPrimary} />
          </LinearGradient>
          <Text style={styles.lockedTitle}>AI Chat Expert</Text>
          <Text style={styles.lockedSubtitle}>Get personalized analysis and betting advice from our AI expert. Available for VIP and Expert subscribers.</Text>
          <Button title="Upgrade to VIP" onPress={() => router.push('/pricing')} variant="gradient" size="lg" gradientColors={Gradients.vip} style={styles.upgradeButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onClose={() => router.back()} matchId={matchIdNum} tokenUsage={tokenUsage} />

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {isLoading && chatMessages.length === 0 ? (
            <LoadingSpinner message="Loading chat..." />
          ) : chatMessages.length === 0 ? (
            <View style={styles.emptyChat}>
              <LinearGradient colors={Gradients.aiSubtle} style={styles.emptyIcon}>
                <Ionicons name="sparkles" size={32} color={Colors.backgroundPrimary} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>AI Expert Ready</Text>
              <Text style={styles.emptySubtitle}>Ask about this match, request predictions, or get betting advice.</Text>
              <View style={styles.suggestions}>
                {['Analyze this match', 'Best betting strategy?', 'Key players to watch'].map((suggestion) => (
                  <Pressable key={suggestion} style={styles.suggestionChip} onPress={() => setInputText(suggestion)}>
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            chatMessages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}

          {isSending && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask the AI expert..."
            placeholderTextColor={Colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Pressable style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]} onPress={handleSend} disabled={!inputText.trim() || isSending}>
            <Ionicons name="send" size={20} color={inputText.trim() && !isSending ? Colors.backgroundPrimary : Colors.textTertiary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Header: React.FC<{ onClose: () => void; matchId: number; tokenUsage?: any }> = ({ onClose, matchId, tokenUsage }) => (
  <View style={styles.header}>
    <Pressable style={styles.backButton} onPress={onClose}>
      <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
    </Pressable>
    <View style={styles.headerCenter}>
      <Text style={styles.headerTitle}>AI Expert</Text>
      {tokenUsage && (
        <Text style={styles.tokenCount}>{formatTokenCount(tokenUsage.remaining)} tokens left</Text>
      )}
    </View>
    <Pressable style={styles.menuButton}>
      <Ionicons name="ellipsis-vertical" size={20} color={Colors.textPrimary} />
    </Pressable>
  </View>
);

const MessageBubble: React.FC<{ message: AIChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.messageContainer, isUser && styles.messageContainerUser]}>
      {!isUser && (
        <LinearGradient colors={Gradients.aiSubtle} style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={14} color={Colors.backgroundPrimary} />
        </LinearGradient>
      )}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>{message.content}</Text>
        {message.ticketProposal && (
          <Card variant="outlined" padding="md" style={styles.ticketProposal}>
            <Text style={styles.ticketProposalTitle}>Suggested Ticket</Text>
            <Text style={styles.ticketProposalOdds}>Total Odds: {message.ticketProposal.totalOdds.toFixed(2)}</Text>
            <View style={styles.ticketActions}>
              <Button title="Accept" onPress={() => {}} variant="primary" size="sm" />
              <Button title="Decline" onPress={() => {}} variant="outline" size="sm" />
            </View>
          </Card>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  tokenCount: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  menuButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  messagesContainer: { padding: Spacing.xl, flexGrow: 1 },
  lockedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'] },
  lockIcon: { width: 80, height: 80, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  lockedTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  lockedSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  upgradeButton: { minWidth: 200 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing['4xl'] },
  emptyIcon: { width: 64, height: 64, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md },
  suggestionChip: { backgroundColor: Colors.backgroundTertiary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.full },
  suggestionText: { fontSize: 13, color: Colors.textPrimary },
  messageContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.lg },
  messageContainerUser: { flexDirection: 'row-reverse' },
  aiAvatar: { width: 28, height: 28, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  messageBubble: { maxWidth: '75%', padding: Spacing.lg, borderRadius: BorderRadius.lg },
  userBubble: { backgroundColor: Colors.accentPrimary, borderBottomRightRadius: BorderRadius.xs },
  aiBubble: { backgroundColor: Colors.backgroundSecondary, borderBottomLeftRadius: BorderRadius.xs },
  messageText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },
  userMessageText: { color: Colors.backgroundPrimary },
  ticketProposal: { marginTop: Spacing.lg },
  ticketProposalTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  ticketProposalOdds: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.lg },
  ticketActions: { flexDirection: 'row', gap: Spacing.md },
  typingIndicator: { alignItems: 'flex-start', marginTop: Spacing.md },
  typingText: { fontSize: 13, color: Colors.textTertiary, fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.md },
  input: { flex: 1, backgroundColor: Colors.backgroundTertiary, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, fontSize: 15, color: Colors.textPrimary, maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: Colors.accentPrimary, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: Colors.backgroundTertiary },
});
