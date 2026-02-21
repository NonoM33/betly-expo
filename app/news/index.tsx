import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Colors, Spacing } from '../../src/constants/theme';
import { useNewsStore } from '../../src/stores';
import { NewsCard } from '../../src/components/news/NewsCard';

export default function NewsScreen() {
  const router = useRouter();
  const { articles, isLoading, loadNews } = useNewsStore();

  useEffect(() => {
    loadNews();
  }, []);

  const handleArticlePress = (articleId: string) => {
    router.push(`/news/${articleId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Actualités',
          headerStyle: { backgroundColor: Colors.backgroundPrimary },
          headerTintColor: Colors.textPrimary,
        }}
      />

      {isLoading && articles.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.accentPrimary} />
        </View>
      ) : (
        <FlatList
          data={articles}
          renderItem={({ item }) => (
            <NewsCard
              article={item}
              onPress={() => handleArticlePress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadNews}
              tintColor={Colors.accentPrimary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Aucune actualité</Text>
              <Text style={styles.emptyText}>
                Les actualités sportives apparaîtront ici
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  list: {
    padding: Spacing.xl,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing['6xl'],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
