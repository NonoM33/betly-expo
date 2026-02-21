import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { colors, spacing, borderRadius } from '../../constants/theme';
import type { NewsArticle } from '../../types';

interface NewsCardProps {
  article: NewsArticle;
  onPress: () => void;
  compact?: boolean;
}

export function NewsCard({ article, onPress, compact = false }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Aujourd\'hui';
    if (isYesterday(date)) return 'Hier';
    return format(date, 'd MMM', { locale: fr });
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={onPress}>
        {article.imageUrl && (
          <Image source={{ uri: article.imageUrl }} style={styles.compactImage} />
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {article.title}
          </Text>
          <View style={styles.compactMeta}>
            <Text style={styles.metaText}>{article.source}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{formatDate(article.publishedAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {article.imageUrl && (
        <Image source={{ uri: article.imageUrl }} style={styles.image} />
      )}
      <View style={styles.content}>
        {article.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        {article.summary && (
          <Text style={styles.summary} numberOfLines={2}>
            {article.summary}
          </Text>
        )}
        <View style={styles.meta}>
          <View style={styles.metaLeft}>
            <Ionicons name="newspaper-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{article.source}</Text>
          </View>
          <View style={styles.metaRight}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatDate(article.publishedAt)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  summary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },
  metaDot: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.background,
  },
  compactContent: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
    marginBottom: 4,
    lineHeight: 18,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
