import React from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius } from '../../constants/theme';

interface ShimmerProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.container,
        { width, height, borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerContainer,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={[
            Colors.backgroundTertiary,
            Colors.backgroundSecondary,
            Colors.backgroundTertiary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

// Shimmer placeholder for match cards
export const MatchCardShimmer: React.FC = () => (
  <View style={shimmerStyles.matchCard}>
    <View style={shimmerStyles.matchCardHeader}>
      <Shimmer width={100} height={14} />
      <Shimmer width={60} height={14} />
    </View>
    <View style={shimmerStyles.matchCardTeams}>
      <View style={shimmerStyles.team}>
        <Shimmer width={32} height={32} borderRadius={BorderRadius.full} />
        <Shimmer width={80} height={14} />
      </View>
      <Shimmer width={40} height={24} />
      <View style={shimmerStyles.team}>
        <Shimmer width={32} height={32} borderRadius={BorderRadius.full} />
        <Shimmer width={80} height={14} />
      </View>
    </View>
    <View style={shimmerStyles.matchCardFooter}>
      <Shimmer width={120} height={12} />
    </View>
  </View>
);

// Shimmer placeholder for tip cards
export const TipCardShimmer: React.FC = () => (
  <View style={shimmerStyles.tipCard}>
    <View style={shimmerStyles.tipCardHeader}>
      <Shimmer width={80} height={20} borderRadius={BorderRadius.full} />
      <Shimmer width={50} height={20} borderRadius={BorderRadius.full} />
    </View>
    <Shimmer width="80%" height={16} style={{ marginVertical: 8 }} />
    <Shimmer width="60%" height={14} />
    <View style={shimmerStyles.tipCardFooter}>
      <Shimmer width={100} height={32} borderRadius={BorderRadius.md} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundTertiary,
    overflow: 'hidden',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 200,
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
});

const shimmerStyles = StyleSheet.create({
  matchCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  matchCardTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  team: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  matchCardFooter: {
    alignItems: 'center',
  },
  tipCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  tipCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tipCardFooter: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
});

export default Shimmer;
