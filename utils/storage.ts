import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  priority?: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  subtasks: SubTask[];
  isExpanded: boolean;
  isDaily?: boolean;
  category?: 'work' | 'projects' | 'life' | 'own';
  priority?: boolean;
}

export interface MoodLog {
  date: string;
  mood: number;
}

export interface DailyHistory {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
  progressPercentage: number;
  mood?: number;
  beCreativeCompleted?: boolean;
}

const TASKS_KEY = '@tasks';
const ARCHIVE_KEY = '@archive';
const MOOD_KEY = '@mood_logs';
const HISTORY_KEY = '@history';
const LAST_ARCHIVE_KEY = '@last_archive_date';

export const getTasks = async (): Promise<Task[]> => {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

export const getArchive = async (): Promise<Task[]> => {
  try {
    const data = await AsyncStorage.getItem(ARCHIVE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading archive:', error);
    return [];
  }
};

export const saveArchive = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving archive:', error);
  }
};

export const getMoodLogs = async (): Promise<MoodLog[]> => {
  try {
    const data = await AsyncStorage.getItem(MOOD_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading mood logs:', error);
    return [];
  }
};

export const saveMoodLogs = async (logs: MoodLog[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(MOOD_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving mood logs:', error);
  }
};

export const getHistory = async (): Promise<DailyHistory[]> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};

export const saveHistory = async (history: DailyHistory[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history:', error);
  }
};

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getLastArchiveDate = async (): Promise<string | null> => {
  try {
    const date = await AsyncStorage.getItem(LAST_ARCHIVE_KEY);
    return date;
  } catch (error) {
    console.error('Error loading last archive date:', error);
    return null;
  }
};

export const saveLastArchiveDate = async (date: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAST_ARCHIVE_KEY, date);
  } catch (error) {
    console.error('Error saving last archive date:', error);
  }
};

export const performDailyReset = async (): Promise<void> => {
  const today = getTodayDate();
  console.log('performDailyReset called for date:', today);

  const previousArchiveDate = await getLastArchiveDate();
  console.log('Previous archive date:', previousArchiveDate);

  await saveLastArchiveDate(today);

  const loadedTasks = await getTasks();
  console.log('Loaded tasks before reset:', loadedTasks.length);
  const loadedMoods = await getMoodLogs();

  const tasksToArchive: Task[] = [];
  const remainingTasks: Task[] = [];

  loadedTasks.forEach(task => {
    if (task.isDaily) {
      const completedSubtasks = task.subtasks.filter(st => st.completed);

      if (completedSubtasks.length > 0) {
        tasksToArchive.push({
          ...task,
          completed: false,
          subtasks: completedSubtasks,
        });
      }

      remainingTasks.push({
        ...task,
        completed: false,
        subtasks: task.subtasks.map(st => ({ ...st, completed: false })),
      });
    } else {
      if (task.completed) {
        tasksToArchive.push(task);
      } else if (task.subtasks.length > 0) {
        const completedSubtasks = task.subtasks.filter(st => st.completed);
        const incompleteSubtasks = task.subtasks.filter(st => !st.completed);

        if (completedSubtasks.length > 0) {
          tasksToArchive.push({
            ...task,
            completed: false,
            subtasks: completedSubtasks,
          });
        }

        if (incompleteSubtasks.length > 0 || completedSubtasks.length === 0) {
          remainingTasks.push({
            ...task,
            subtasks: incompleteSubtasks,
          });
        }
      } else {
        remainingTasks.push(task);
      }
    }
  });

  const archiveDate = previousArchiveDate || today;
  console.log('Previous archive date:', previousArchiveDate, '| Today:', today, '| Using archive date:', archiveDate);

  if (tasksToArchive.length > 0) {
    const currentArchive = await getArchive();
    const archivedWithDate = tasksToArchive.map(task => ({
      ...task,
      archivedDate: archiveDate,
    }));
    await saveArchive([...currentArchive, ...archivedWithDate]);
  }

  let completedCount = 0;
  let totalCount = 0;
  loadedTasks.forEach(task => {
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

  let progress = 0;
  if (totalCount === 0) {
    progress = 0;
  } else if (totalCount < 3) {
    progress = completedCount === totalCount ? 100 : (completedCount / totalCount) * 100;
  } else {
    progress = completedCount >= 3 ? 100 : (completedCount / 3) * 100;
  }

  const dayMood = loadedMoods.find(log => log.date === archiveDate);
  console.log('Looking for mood on date:', archiveDate, 'Found:', dayMood);
  const beCreativeCompleted = loadedTasks.some(t => t.text === 'Be creative' && t.isDaily && t.completed);
  const historyEntry: DailyHistory = {
    date: archiveDate,
    tasksCompleted: completedCount,
    totalTasks: totalCount,
    progressPercentage: progress,
    mood: dayMood?.mood,
    beCreativeCompleted: beCreativeCompleted,
  };
  console.log('History entry created:', historyEntry);

  const currentHistory = await getHistory();
  const existingIndex = currentHistory.findIndex(h => h.date === archiveDate);
  if (existingIndex >= 0) {
    currentHistory[existingIndex] = historyEntry;
  } else {
    currentHistory.push(historyEntry);
  }
  await saveHistory(currentHistory);

  const clearedMoods = loadedMoods.filter(log => log.date !== archiveDate);
  await saveMoodLogs(clearedMoods);
  console.log('Mood cleared for date:', archiveDate);

  console.log('Saving remaining tasks:', remainingTasks.length);
  await saveTasks(remainingTasks);
  console.log('Daily reset complete - tasks saved');
};
