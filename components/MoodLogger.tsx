import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface MoodLoggerProps {
  onLogMood: (mood: number) => void;
  currentMood?: number;
}

const MOODS = [
  { value: 1, color: '#ef4444', label: '😢' },
  { value: 2, color: '#f97316', label: '😕' },
  { value: 3, color: '#f59e0b', label: '😐' },
  { value: 4, color: '#84cc16', label: '🙂' },
  { value: 5, color: '#10b981', label: '😄' },
];

export default function MoodLogger({ onLogMood, currentMood }: MoodLoggerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HOW'D YOU DO TODAY?</Text>
      <View style={styles.moodsContainer}>
        {MOODS.map(mood => (
          <TouchableOpacity
            key={mood.value}
            onPress={() => onLogMood(mood.value)}
            style={[
              styles.moodButton,
              { backgroundColor: mood.color },
              currentMood === mood.value && styles.moodButtonSelected,
            ]}
          >
            <Text style={styles.moodEmoji}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffef7',
    borderRadius: 24,
    padding: 20,
    borderWidth: 4,
    borderColor: '#1d5564',
    shadowColor: '#1d5564',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Cute Dino',
    color: '#1d5564',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  moodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  moodButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    borderWidth: 3,
    borderColor: '#1d5564',
  },
  moodButtonSelected: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
    borderWidth: 4,
  },
  moodEmoji: {
    fontSize: 28,
  },
});
