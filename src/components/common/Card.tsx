import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing, GradientColors } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'gradient' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  gradientColors?: GradientColors;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  gradientColors,
  onPress,
  style,
}) => {
  const containerStyles = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles],
    style,
  ];

  if (variant === 'gradient') {
    const content = (
      <LinearGradient
        colors={gradientColors || [Colors.backgroundSecondary, Colors.backgroundTertiary] as GradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, styles.gradient, styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles], style]}
      >
        {children}
      </LinearGradient>
    );

    if (onPress) {
      return (
        <Pressable onPress={onPress} style={styles.pressable}>
          {content}
        </Pressable>
      );
    }
    return content;
  }

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={containerStyles}>
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  pressable: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  // Variants
  default: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  elevated: {
    backgroundColor: Colors.backgroundSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Padding
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: Spacing.lg,
  },
  paddingMd: {
    padding: Spacing.xl,
  },
  paddingLg: {
    padding: Spacing['2xl'],
  },
});

export default Card;
