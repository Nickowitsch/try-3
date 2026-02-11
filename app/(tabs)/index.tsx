import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Flag } from 'lucide-react-native';
import BeCreativeButton from '@/components/BeCreativeButton';
import MoodLogger from '@/components/MoodLogger';
import ProgressBar from '@/components/ProgressBar';
import {
  getTasks,
  saveTasks,
  getMoodLogs,
  saveMoodLogs,
  getTodayDate,
  getLastArchiveDate,
  performDailyReset,
  Task,
  MoodLog,
} from '@/utils/storage';
import { requestNotificationPermissions, scheduleDailyNotifications } from '@/utils/notifications';

export default function StartScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [dailyProgress, setDailyProgress] = useState(0);

  const loadData = async () => {
    const today = getTodayDate();
    const lastArchiveDate = await getLastArchiveDate();
    console.log('loadData - today:', today, 'lastArchiveDate:', lastArchiveDate);

    if (lastArchiveDate !== today) {
      console.log('Triggering auto reset');
      await performDailyReset();
    }

    const loadedTasks = await getTasks();
    console.log('Loaded tasks:', loadedTasks.length, loadedTasks);
    const loadedMoods = await getMoodLogs();

    const hasBeCreative = loadedTasks.some(t => t.text === 'Be creative' && t.isDaily);

    if (!hasBeCreative) {
      const beCreativeTask: Task = {
        id: 'daily-be-creative',
        text: 'Be creative',
        completed: false,
        subtasks: [],
        isExpanded: false,
        isDaily: true,
      };
      loadedTasks.unshift(beCreativeTask);
      await saveTasks(loadedTasks);
    }

    setTasks(loadedTasks);
    setMoodLogs(loadedMoods);
    calculateDailyProgress(loadedTasks);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        const allTasks = await getTasks();
        await scheduleDailyNotifications(allTasks);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const updateNotifications = async () => {
      await scheduleDailyNotifications(tasks);
    };
    if (tasks.length > 0) {
      updateNotifications();
    }
  }, [tasks]);

  const calculateDailyProgress = (taskList: Task[]) => {
    let completedCount = 0;
    let totalCount = 0;

    taskList.forEach(task => {
      if (task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          totalCount++;
          if (subtask.completed) completedCount++;
        });
      } else {
        totalCount++;
        if (task.completed) completedCount++;
      }
    });

    if (totalCount === 0) {
      setDailyProgress(0);
    } else if (totalCount < 3) {
      setDailyProgress(completedCount === totalCount ? 100 : (completedCount / totalCount) * 100);
    } else {
      setDailyProgress(completedCount >= 3 ? 100 : (completedCount / 3) * 100);
    }
  };

  const toggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    calculateDailyProgress(updatedTasks);
  };

  const toggleExpand = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, isExpanded: !task.isExpanded } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const addSubtask = async (taskId: string, text: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: [
            ...task.subtasks,
            {
              id: Date.now().toString(),
              text,
              completed: false,
            },
          ],
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allSubtasksCompleted = updatedSubtasks.every(st => st.completed);
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksCompleted && updatedSubtasks.length > 0,
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    calculateDailyProgress(updatedTasks);
  };

  const deleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    calculateDailyProgress(updatedTasks);
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.filter(st => st.id !== subtaskId),
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };


  const logMood = async (mood: number) => {
    const today = getTodayDate();
    const updatedLogs = moodLogs.filter(log => log.date !== today);
    updatedLogs.push({ date: today, mood });
    setMoodLogs(updatedLogs);
    await saveMoodLogs(updatedLogs);
  };

  const todayMood = moodLogs.find(log => log.date === getTodayDate());

  const getProgressTextColor = (percent: number): string => {
    if (percent === 100) return '#1d5564';
    if (percent >= 66) return '#e8c170';
    return '#eb6f6f';
  };

  const beCreativeTask = tasks.find(t => t.text === 'Be creative' && t.isDaily);

  const getCategoryTasks = (category: 'work' | 'projects' | 'life' | 'own') => {
    return tasks.filter(t => t.category === category);
  };

  const getCategoryProgress = (category: 'work' | 'projects' | 'life' | 'own') => {
    const categoryTasks = getCategoryTasks(category);
    if (categoryTasks.length === 0) return 0;

    let completedCount = 0;
    let totalCount = 0;

    categoryTasks.forEach(task => {
      if (task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          totalCount++;
          if (subtask.completed) completedCount++;
        });
      } else {
        totalCount++;
        if (task.completed) completedCount++;
      }
    });

    return totalCount === 0 ? 0 : (completedCount / totalCount) * 100;
  };

  const getCategoryColor = (category: 'work' | 'projects' | 'life' | 'own') => {
    switch (category) {
      case 'work': return '#5b9aa9';
      case 'projects': return '#8b4a4a';
      case 'life': return '#5b9aa9';
      case 'own': return '#d4a843';
      default: return '#1d5564';
    }
  };

  const hasPriorityTasks = (category: 'work' | 'projects' | 'life' | 'own') => {
    return getCategoryTasks(category).some(task => task.priority && !task.completed);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dailyProgressContainer}>
          <Text style={styles.dailyProgressTitle}>YOUR DAILY GRIND</Text>
          <ProgressBar percentage={dailyProgress} height={16} />
          <Text style={[styles.dailyProgressText, { color: getProgressTextColor(dailyProgress) }]}>
            {dailyProgress === 100 ? 'CRUSHED IT! 💪' : dailyProgress >= 66 ? "ALMOST THERE!" : dailyProgress > 0 ? "TWO TO GO!" : "GET GOING!"}
          </Text>
        </View>

        <View style={styles.moodLoggerContainer}>
          <MoodLogger onLogMood={logMood} currentMood={todayMood?.mood} />
        </View>

        {beCreativeTask && (
          <View style={styles.beCreativeContainer}>
            <BeCreativeButton
              task={beCreativeTask}
              onToggle={toggleTask}
            />
          </View>
        )}

        <View style={styles.categoriesGrid}>
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => router.push('/(tabs)/work')}
          >
            <Text style={styles.categoryTitle}>WORK</Text>
            <View style={styles.categoryCountContainer}>
              <Text style={styles.categoryCount}>{getCategoryTasks('work').length} {getCategoryTasks('work').length === 1 ? 'task' : 'tasks'}</Text>
              {hasPriorityTasks('work') && (
                <Flag size={14} color="#eb6f6f" strokeWidth={3} fill="#eb6f6f" />
              )}
            </View>
            <View style={styles.categoryProgressContainer}>
              <View
                style={[
                  styles.categoryProgressBar,
                  { width: `${getCategoryProgress('work')}%`, backgroundColor: getCategoryColor('work') }
                ]}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => router.push('/(tabs)/projects')}
          >
            <Text style={styles.categoryTitle}>PROJECTS</Text>
            <View style={styles.categoryCountContainer}>
              <Text style={styles.categoryCount}>{getCategoryTasks('projects').length} {getCategoryTasks('projects').length === 1 ? 'task' : 'tasks'}</Text>
              {hasPriorityTasks('projects') && (
                <Flag size={14} color="#eb6f6f" strokeWidth={3} fill="#eb6f6f" />
              )}
            </View>
            <View style={styles.categoryProgressContainer}>
              <View
                style={[
                  styles.categoryProgressBar,
                  { width: `${getCategoryProgress('projects')}%`, backgroundColor: getCategoryColor('projects') }
                ]}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => router.push('/(tabs)/life')}
          >
            <Text style={styles.categoryTitle}>LIFE</Text>
            <View style={styles.categoryCountContainer}>
              <Text style={styles.categoryCount}>{getCategoryTasks('life').length} {getCategoryTasks('life').length === 1 ? 'task' : 'tasks'}</Text>
              {hasPriorityTasks('life') && (
                <Flag size={14} color="#eb6f6f" strokeWidth={3} fill="#eb6f6f" />
              )}
            </View>
            <View style={styles.categoryProgressContainer}>
              <View
                style={[
                  styles.categoryProgressBar,
                  { width: `${getCategoryProgress('life')}%`, backgroundColor: getCategoryColor('life') }
                ]}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => router.push('/(tabs)/own')}
          >
            <Text style={styles.categoryTitle}>OWN</Text>
            <View style={styles.categoryCountContainer}>
              <Text style={styles.categoryCount}>{getCategoryTasks('own').length} {getCategoryTasks('own').length === 1 ? 'task' : 'tasks'}</Text>
              {hasPriorityTasks('own') && (
                <Flag size={14} color="#eb6f6f" strokeWidth={3} fill="#eb6f6f" />
              )}
            </View>
            <View style={styles.categoryProgressContainer}>
              <View
                style={[
                  styles.categoryProgressBar,
                  { width: `${getCategoryProgress('own')}%`, backgroundColor: getCategoryColor('own') }
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    paddingBottom: 20,
  },
  dailyProgressContainer: {
    backgroundColor: '#fffef7',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#1d5564',
    shadowColor: '#1d5564',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  dailyProgressTitle: {
    fontSize: 18,
    fontFamily: 'Cute Dino',
    color: '#1d5564',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  dailyProgressText: {
    fontSize: 20,
    fontFamily: 'Cute Dino',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  moodLoggerContainer: {
    paddingHorizontal: 20,
  },
  beCreativeContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 16,
  },
  categoryCard: {
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
    flex: 1,
    minWidth: '45%',
    minHeight: 140,
  },
  categoryTitle: {
    fontSize: 22,
    fontFamily: 'Cute Dino',
    color: '#1d5564',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  categoryCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  categoryCount: {
    fontSize: 14,
    fontFamily: 'Cute Dino',
    color: '#1d5564',
    opacity: 0.7,
  },
  categoryProgressContainer: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1d5564',
  },
  categoryProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
});
