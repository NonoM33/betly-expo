import React from 'react';
import { View, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, TeamLogoSize, BorderRadius } from '../../constants/theme';

interface TeamLogoProps {
  uri?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackIcon?: boolean;
  style?: ImageStyle;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  uri,
  size = 'md',
  fallbackIcon = true,
  style,
}) => {
  const dimension = TeamLogoSize[size];

  if (!uri) {
    if (fallbackIcon) {
      return (
        <View style={[styles.fallback, { width: dimension, height: dimension }, style]}>
          <Ionicons name="shield-outline" size={dimension * 0.6} color={Colors.textTertiary} />
        </View>
      );
    }
    return null;
  }

  return (
    <Image
      source={{ uri }}
      style={[{ width: dimension, height: dimension }, style]}
      contentFit="contain"
      transition={200}
    />
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.sm,
  },
});

export default TeamLogo;
