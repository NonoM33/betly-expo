import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useNewsStore } from '../../src/stores';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    currentArticle,
    currentArticleContent,
    isLoadingArticle,
    loadArticle,
    loadArticleContent,
    clearCurrentArticle,
  } = useNewsStore();

  useEffect(() => {
    if (id) {
      loadArticle(id);
      loadArticleContent(id);
    }

    return () => {
      clearCurrentArticle();
    };
  }, [id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(parseISO(dateString), 'd MMMM yyyy à HH:mm', { locale: fr });
  };

  if (isLoadingArticle && !currentArticle) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Article',
            headerStyle: { backgroundColor: Colors.backgroundPrimary },
            headerTintColor: Colors.textPrimary,
          }}
        />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentArticle) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Article',
            headerStyle: { backgroundColor: Colors.backgroundPrimary },
            headerTintColor: Colors.textPrimary,
          }}
        />
        <View style={styles.error}>
          <Ionicons name="alert-circle" size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Article non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: Colors.backgroundPrimary },
          headerTintColor: Colors.textPrimary,
          headerTransparent: true,
        }}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {currentArticle.imageUrl && (
          <Image
            source={{ uri: currentArticle.imageUrl }}
            style={styles.heroImage}
          />
        )}

        <View style={styles.content}>
          {/* Category */}
          {currentArticle.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{currentArticle.category}</Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{currentArticle.title}</Text>

          {/* Meta */}
          <View style={styles.meta}>
            {currentArticle.source && (
              <View style={styles.metaItem}>
                <Ionicons name="newspaper-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaText}>{currentArticle.source}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.metaText}>
                {formatDate(currentArticle.publishedAt)}
              </Text>
            </View>
          </View>

          {/* Summary */}
          {currentArticle.summary && (
            <Text style={styles.summary}>{currentArticle.summary}</Text>
          )}

          {/* Content */}
          {isLoadingArticle ? (
            <View style={styles.contentLoading}>
              <ActivityIndicator size="small" color={Colors.accentPrimary} />
              <Text style={styles.contentLoadingText}>
                Chargement du contenu...
              </Text>
            </View>
          ) : currentArticleContent ? (
            <Text style={styles.articleContent}>{currentArticleContent}</Text>
          ) : currentArticle.content ? (
            <Text style={styles.articleContent}>{currentArticle.content}</Text>
          ) : (
            <Text style={styles.noContent}>
              Contenu non disponible. Consultez l'article sur le site source.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  scroll: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    padding: Spacing['3xl'],
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 209, 102, 0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentPrimary,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 32,
    marginBottom: Spacing.xl,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  summary: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing['3xl'],
    fontStyle: 'italic',
  },
  contentLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    gap: Spacing.lg,
  },
  contentLoadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  articleContent: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  noContent: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing['4xl'],
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
