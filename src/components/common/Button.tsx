import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, ButtonHeight, AnimationDuration, GradientColors } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  gradientColors?: GradientColors;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  gradientColors,
  style,
  textStyle,
  haptic = true,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const buttonStyles = [
    styles.base,
    styles[size],
    styles[variant],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
    disabled && styles.textDisabled,
    textStyle,
  ];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'gradient' ? Colors.backgroundPrimary : Colors.accentPrimary}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  if (variant === 'gradient' && !disabled) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={gradientColors || [Colors.accentPrimary, Colors.gradientEmerald] as GradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, styles[size], styles.gradient]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={buttonStyles}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: BorderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },

  // Sizes
  sm: {
    height: ButtonHeight.sm,
    paddingHorizontal: 12,
  },
  md: {
    height: ButtonHeight.md,
    paddingHorizontal: 16,
  },
  lg: {
    height: ButtonHeight.lg,
    paddingHorizontal: 20,
  },
  xl: {
    height: ButtonHeight.xl,
    paddingHorizontal: 24,
  },

  // Variants
  primary: {
    backgroundColor: Colors.accentPrimary,
  },
  secondary: {
    backgroundColor: Colors.backgroundTertiary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  gradient: {
    overflow: 'hidden',
  },

  disabled: {
    backgroundColor: Colors.backgroundTertiary,
    borderColor: Colors.border,
    opacity: 0.5,
  },

  // Text
  text: {
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 15,
  },
  textXl: {
    fontSize: 16,
  },
  textPrimary: {
    color: Colors.backgroundPrimary,
  },
  textSecondary: {
    color: Colors.textPrimary,
  },
  textOutline: {
    color: Colors.textPrimary,
  },
  textGhost: {
    color: Colors.accentPrimary,
  },
  textGradient: {
    color: Colors.backgroundPrimary,
  },
  textDisabled: {
    color: Colors.textMuted,
  },
});

export default Button;
