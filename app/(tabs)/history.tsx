import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Lightbulb, RefreshCw } from 'lucide-react-native';
import ProgressBar from '@/components/ProgressBar';
import { getHistory, getMoodLogs, DailyHistory, performDailyReset } from '@/utils/storage';

const MOODS = [
  { value: 1, color: '#ef4444', label: '😢' },
  { value: 2, color: '#f97316', label: '😕' },
  { value: 3, color: '#f59e0b', label: '😐' },
  { value: 4, color: '#84cc16', label: '🙂' },
  { value: 5, color: '#10b981', label: '😄' },
];

export default function HistoryScreen() {
  const [history, setHistory] = useState<DailyHistory[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        const historyData = await getHistory();
        const sortedHistory = historyData.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setHistory(sortedHistory);
      };
      loadHistory();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getMoodInfo = (mood?: number) => {
    if (!mood) return null;
    return MOODS.find(m => m.value === mood);
  };

  const handleTestReset = async () => {
    console.log('Test reset button pressed');

    if (Platform.OS === 'web') {
      if (confirm('Test Daily Reset\n\nThis will trigger the daily reset now (archives tasks, resets daily tasks, creates history entry). Continue?')) {
        try {
          console.log('Starting daily reset...');
          await performDailyReset();
          console.log('Daily reset completed');
          const updatedHistory = await getHistory();
          const sortedHistory = updatedHistory.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setHistory(sortedHistory);
          alert('Reset Complete! Go to the main screen to see tasks reset.');
        } catch (error) {
          console.error('Reset error:', error);
          alert('Error: Failed to perform reset - ' + error);
        }
      }
    } else {
      Alert.alert(
        'Test Daily Reset',
        'This will trigger the daily reset now (archives tasks, resets daily tasks, creates history entry). Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('Starting daily reset...');
                await performDailyReset();
                console.log('Daily reset completed');
                const updatedHistory = await getHistory();
                const sortedHistory = updatedHistory.sort((a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setHistory(sortedHistory);
                Alert.alert('Reset Complete', 'Daily reset performed! Go to the main screen to see tasks reset.');
              } catch (error) {
                console.error('Reset error:', error);
                Alert.alert('Error', 'Failed to perform reset: ' + error);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>YOUR HISTORY</Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestReset}
          >
            <RefreshCw size={20} color="#1d5564" strokeWidth={3} />
            <Text style={styles.testButtonText}>TEST RESET</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.historyList}
        contentContainerStyle={styles.historyListContent}
        showsVerticalScrollIndicator={false}
      >
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No wins yet!</Text>
            <Text style={styles.emptySubtext}>Start crushing tasks to build your streak!</Text>
          </View>
        ) : (
          history.map((entry, index) => {
            const moodInfo = getMoodInfo(entry.mood);
            return (
              <View key={`${entry.date}-${index}`} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
                  <View style={styles.badgesContainer}>
                    {entry.beCreativeCompleted && (
                      <View style={styles.creativeBadge}>
                        <Lightbulb size={18} color="#1d5564" strokeWidth={3} />
                      </View>
                    )}
                    {moodInfo && (
                      <View style={[styles.moodBadge, { backgroundColor: moodInfo.color }]}>
                        <Text style={styles.moodEmoji}>{moodInfo.label}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.statsContainer}>
                  <Text style={styles.statsText}>
                    {entry.tasksCompleted} of {entry.totalTasks} tasks completed
                  </Text>
                </View>

                <View style={styles.progressContainer}>
                  <ProgressBar percentage={entry.progressPercentage} height={8} />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e5b8',
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Cute Dino',
    color: '#1d5564',
    letterSpacing: 0.5,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#60a5fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#1d5564',
  },
  testButtonText: {
    fontSize: 12,
    fontFamily: 'Cute Dino',
    color: '#1d5564',
    fontWeight: '800',
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyListContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1d5564',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  historyCard: {
    backgroundColor: '#fffef7',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#1d5564',
    shadowColor: '#1d5564',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1d5564',
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creativeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1d5564',
    backgroundColor: '#60a5fa',
  },
  moodBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1d5564',
  },
  moodEmoji: {
    fontSize: 22,
  },
  statsContainer: {
    marginBottom: 6,
  },
  statsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1d5564',
  },
  progressContainer: {
    marginBottom: 0,
  },
});
