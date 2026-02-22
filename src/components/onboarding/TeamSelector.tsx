import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../utils/haptics';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';

interface League {
  id: number;
  name: string;
  teams: Team[];
}

interface Team {
  id: number;
  name: string;
  shortName?: string;
}

interface TeamSelectorProps {
  leagues: League[];
  selectedTeams: number[];
  onSelectionChange: (teamIds: number[]) => void;
  maxSelection?: number;
}

export function TeamSelector({
  leagues,
  selectedTeams,
  onSelectionChange,
  maxSelection = 5,
}: TeamSelectorProps) {
  const toggleTeam = (teamId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (selectedTeams.includes(teamId)) {
      onSelectionChange(selectedTeams.filter((id) => id !== teamId));
    } else if (selectedTeams.length < maxSelection) {
      onSelectionChange([...selectedTeams, teamId]);
    }
  };

  const getTeamInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 3).toUpperCase();
    }
    return words
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Équipes favorites</Text>
        <Text style={styles.headerSubtitle}>
          {selectedTeams.length}/{maxSelection} sélectionnées
        </Text>
      </View>

      {leagues.map((league) => (
        <View key={league.id} style={styles.leagueSection}>
          <Text style={styles.leagueTitle}>{league.name}</Text>
          <View style={styles.teamsGrid}>
            {league.teams.map((team) => {
              const isSelected = selectedTeams.includes(team.id);
              return (
                <TouchableOpacity
                  key={team.id}
                  style={[styles.teamCard, isSelected && styles.teamCardSelected]}
                  onPress={() => toggleTeam(team.id)}
                  activeOpacity={0.7}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={gradients.primary as [string, string]}
                      style={styles.teamAvatar}
                    >
                      <Text style={styles.teamInitials}>
                        {getTeamInitials(team.name)}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.teamAvatar, styles.teamAvatarDefault]}>
                      <Text style={[styles.teamInitials, styles.teamInitialsDefault]}>
                        {getTeamInitials(team.name)}
                      </Text>
                    </View>
                  )}
                  <Text
                    style={[styles.teamName, isSelected && styles.teamNameSelected]}
                    numberOfLines={2}
                  >
                    {team.shortName || team.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.accent,
  },
  leagueSection: {
    marginBottom: spacing.lg,
  },
  leagueTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  teamCard: {
    width: '25%',
    padding: spacing.xs,
    alignItems: 'center',
  },
  teamCardSelected: {
    // Selected state handled by avatar
  },
  teamAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  teamAvatarDefault: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  teamInitialsDefault: {
    color: colors.textSecondary,
  },
  teamName: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  teamNameSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
