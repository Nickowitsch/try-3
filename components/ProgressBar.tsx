import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressBarProps {
  percentage: number;
  height?: number;
}

export default function ProgressBar({ percentage, height = 8 }: ProgressBarProps) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const getColor = (percent: number): [string, string] => {
    if (percent === 0) return ['#eb6f6f', '#eb6f6f'];
    if (percent < 66) return ['#eb6f6f', '#f87171'];
    if (percent < 100) return ['#e8c170', '#f5d591'];
    return ['#1d5564', '#2a7a8f'];
  };

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.background}>
        {clampedPercentage > 0 && (
          <LinearGradient
            colors={getColor(clampedPercentage)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: `${clampedPercentage}%` }]}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  background: {
    width: '100%',
    height: '100%',
    backgroundColor: '#d4c5a0',
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1d5564',
  },
  fill: {
    height: '100%',
    borderRadius: 100,
  },
});
