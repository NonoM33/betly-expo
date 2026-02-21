import { create } from 'zustand';
import { aiChatService } from '../api/services';
import type { AIChatMessage, AITokenUsage, TicketProposal } from '../types';

interface AIChatState {
  // State
  messages: Record<number, AIChatMessage[]>; // matchId -> messages
  tokenUsage: AITokenUsage | null;
  currentMatchId: number | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  loadUsage: () => Promise<void>;
  loadHistory: (matchId: number) => Promise<void>;
  sendMessage: (matchId: number, message: string) => Promise<AIChatMessage>;
  deleteConversation: (matchId: number) => Promise<void>;
  updateTicketStatus: (messageId: string, status: 'accepted' | 'declined') => Promise<void>;
  convertCredits: () => Promise<void>;
  setCurrentMatch: (matchId: number | null) => void;
  clearError: () => void;

  // Helpers
  hasTokens: () => boolean;
  getRemainingTokens: () => number;
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
  messages: {},
  tokenUsage: null,
  currentMatchId: null,
  isLoading: false,
  isSending: false,
  error: null,

  loadUsage: async () => {
    try {
      const tokenUsage = await aiChatService.getUsage();
      set({ tokenUsage });
    } catch (error: any) {
      console.error('Failed to load AI chat usage:', error);
    }
  },

  loadHistory: async (matchId: number) => {
    try {
      set({ isLoading: true, error: null, currentMatchId: matchId });

      const history = await aiChatService.getHistory(matchId);

      set((state) => ({
        messages: {
          ...state.messages,
          [matchId]: history,
        },
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to load chat history' });
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (matchId: number, message: string) => {
    try {
      set({ isSending: true, error: null });

      // Add user message optimistically
      const userMessage: AIChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        messages: {
          ...state.messages,
          [matchId]: [...(state.messages[matchId] || []), userMessage],
        },
      }));

      // Send to API
      const response = await aiChatService.sendMessage(matchId, message);

      // Replace temp message with real one and add response
      set((state) => ({
        messages: {
          ...state.messages,
          [matchId]: [
            ...(state.messages[matchId] || []).filter((m) => !m.id.startsWith('temp-')),
            { ...userMessage, id: `user-${response.id}` },
            response,
          ],
        },
      }));

      // Update token usage if returned
      if (response.tokensUsed) {
        const currentUsage = get().tokenUsage;
        if (currentUsage) {
          set({
            tokenUsage: {
              ...currentUsage,
              used: currentUsage.used + response.tokensUsed,
              remaining: currentUsage.remaining - response.tokensUsed,
            },
          });
        }
      }

      return response;
    } catch (error: any) {
      // Remove optimistic user message on error
      set((state) => ({
        messages: {
          ...state.messages,
          [matchId]: (state.messages[matchId] || []).filter((m) => !m.id.startsWith('temp-')),
        },
        error: error.message || 'Failed to send message',
      }));
      throw error;
    } finally {
      set({ isSending: false });
    }
  },

  deleteConversation: async (matchId: number) => {
    try {
      await aiChatService.deleteConversation(matchId);

      set((state) => {
        const { [matchId]: _, ...remaining } = state.messages;
        return { messages: remaining };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete conversation' });
    }
  },

  updateTicketStatus: async (messageId: string, status: 'accepted' | 'declined') => {
    try {
      await aiChatService.updateTicketStatus(messageId, status);

      // Update the ticket proposal status in the message
      const matchId = get().currentMatchId;
      if (matchId) {
        set((state) => ({
          messages: {
            ...state.messages,
            [matchId]: (state.messages[matchId] || []).map((msg) => {
              if (msg.id === messageId && msg.ticketProposal) {
                return {
                  ...msg,
                  ticketProposal: {
                    ...msg.ticketProposal,
                    status,
                  },
                };
              }
              return msg;
            }),
          },
        }));
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update ticket status' });
    }
  },

  convertCredits: async () => {
    try {
      set({ isLoading: true, error: null });

      const tokenUsage = await aiChatService.convertCredits();
      set({ tokenUsage });
    } catch (error: any) {
      set({ error: error.message || 'Failed to convert credits' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentMatch: (matchId: number | null) => {
    set({ currentMatchId: matchId });
  },

  clearError: () => set({ error: null }),

  // Helpers
  hasTokens: () => {
    const usage = get().tokenUsage;
    return !!usage && usage.remaining > 0;
  },

  getRemainingTokens: () => {
    return get().tokenUsage?.remaining || 0;
  },
}));

// Helper to format token count
export const formatTokenCount = (tokens: number): string => {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
};

// Check if message has ticket proposal
export const hasTicketProposal = (message: AIChatMessage): boolean => {
  return !!message.ticketProposal;
};
