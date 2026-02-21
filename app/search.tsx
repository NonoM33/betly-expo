import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSearchStore, getSearchResultIcon, getSearchResultRoute } from '../src/stores/searchStore';
import { Card } from '../src/components/common/Card';
import { LoadingSpinner } from '../src/components/common/LoadingSpinner';
import { EmptyState } from '../src/components/common/EmptyState';
import { TeamLogo } from '../src/components/common/TeamLogo';
import { Colors, Spacing, BorderRadius } from '../src/constants/theme';
import type { SearchResult } from '../src/types';

export default function SearchScreen() {
  const router = useRouter();
  const {
    query,
    results,
    recentSearches,
    isLoading,
    hasSearched,
    setQuery,
    search,
    clearResults,
    loadRecentSearches,
    removeRecentSearch,
    clearRecentSearches,
  } = useSearchStore();

  const [inputValue, setInputValue] = useState(query);
  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setQuery(text);

    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (text.trim().length >= 2) {
      const timeout = setTimeout(() => search(text), 300);
      setDebounceTimeout(timeout);
    } else if (text.trim().length === 0) {
      clearResults();
    }
  };

  const handleClear = () => {
    setInputValue('');
    setQuery('');
    clearResults();
  };

  const handleResultPress = (result: SearchResult) => {
    Keyboard.dismiss();
    const route = getSearchResultRoute(result);
    router.push(route as any);
  };

  const handleRecentPress = (term: string) => {
    setInputValue(term);
    search(term);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams, matches, players..."
            placeholderTextColor={Colors.textTertiary}
            value={inputValue}
            onChangeText={handleInputChange}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => inputValue.trim() && search(inputValue)}
          />
          {inputValue.length > 0 && (
            <Pressable onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {isLoading ? (
          <LoadingSpinner message="Searching..." />
        ) : hasSearched && results.length === 0 ? (
          <EmptyState icon="search-outline" title="No results" message={`No results found for "${query}"`} />
        ) : hasSearched && results.length > 0 ? (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Results</Text>
            {results.map((result, index) => (
              <SearchResultItem key={`${result.type}-${result.id}-${index}`} result={result} onPress={() => handleResultPress(result)} />
            ))}
          </View>
        ) : (
          <>
            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.recentHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <Pressable onPress={clearRecentSearches}>
                    <Text style={styles.clearText}>Clear All</Text>
                  </Pressable>
                </View>
                {recentSearches.map((term, index) => (
                  <RecentSearchItem key={index} term={term} onPress={() => handleRecentPress(term)} onRemove={() => removeRecentSearch(term)} />
                ))}
              </View>
            )}

            <View style={styles.suggestionsSection}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              <View style={styles.suggestions}>
                {['Champions League', 'Premier League', 'PSG', 'Barcelona', 'Mbappe'].map((term) => (
                  <Pressable key={term} style={styles.suggestionChip} onPress={() => handleRecentPress(term)}>
                    <Text style={styles.suggestionText}>{term}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const SearchResultItem: React.FC<{ result: SearchResult; onPress: () => void }> = ({ result, onPress }) => (
  <Pressable style={styles.resultItem} onPress={onPress}>
    {result.imageUrl ? (
      <TeamLogo uri={result.imageUrl} size="md" />
    ) : (
      <View style={styles.resultIcon}>
        <Ionicons name={getSearchResultIcon(result.type) as any} size={20} color={Colors.textSecondary} />
      </View>
    )}
    <View style={styles.resultContent}>
      <Text style={styles.resultName}>{result.name}</Text>
      {result.subtitle && <Text style={styles.resultSubtitle}>{result.subtitle}</Text>}
    </View>
    <View style={styles.resultType}>
      <Text style={styles.resultTypeText}>{result.type}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
  </Pressable>
);

const RecentSearchItem: React.FC<{ term: string; onPress: () => void; onRemove: () => void }> = ({ term, onPress, onRemove }) => (
  <Pressable style={styles.recentItem} onPress={onPress}>
    <Ionicons name="time-outline" size={18} color={Colors.textTertiary} />
    <Text style={styles.recentText}>{term}</Text>
    <Pressable onPress={onRemove} hitSlop={8}>
      <Ionicons name="close" size={18} color={Colors.textTertiary} />
    </Pressable>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundTertiary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, height: 44, gap: Spacing.md },
  searchInput: { flex: 1, fontSize: 16, color: Colors.textPrimary },
  scrollView: { flex: 1 },
  content: { padding: Spacing.xl },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.lg },
  resultsSection: { marginBottom: Spacing['2xl'] },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.lg },
  resultIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: Colors.backgroundTertiary, alignItems: 'center', justifyContent: 'center' },
  resultContent: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  resultSubtitle: { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },
  resultType: { backgroundColor: Colors.backgroundTertiary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  resultTypeText: { fontSize: 10, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase' },
  recentSection: { marginBottom: Spacing['2xl'] },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  clearText: { fontSize: 13, color: Colors.accentPrimary },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.lg },
  recentText: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  suggestionsSection: { marginBottom: Spacing['2xl'] },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  suggestionChip: { backgroundColor: Colors.backgroundTertiary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.full },
  suggestionText: { fontSize: 14, color: Colors.textPrimary },
});
