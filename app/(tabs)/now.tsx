import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import TaskItem from '@/components/TaskItem';
import { getTasks, saveTasks, Task } from '@/utils/storage';

export default function NowScreen() {
  const [workTasks, setWorkTasks] = useState<Task[]>([]);
  const [projectsTasks, setProjectsTasks] = useState<Task[]>([]);
  const [lifeTasks, setLifeTasks] = useState<Task[]>([]);
  const [ownTasks, setOwnTasks] = useState<Task[]>([]);

  const loadData = async () => {
    const loadedTasks = await getTasks();

    const priorityTasks = loadedTasks.filter(task => {
      if (task.completed) return false;
      if (task.priority) return true;
      return task.subtasks.some(st => st.priority && !st.completed);
    });

    setWorkTasks(priorityTasks.filter(t => t.category === 'work'));
    setProjectsTasks(priorityTasks.filter(t => t.category === 'projects'));
    setLifeTasks(priorityTasks.filter(t => t.category === 'life'));
    setOwnTasks(priorityTasks.filter(t => t.category === 'own'));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const toggleTask = async (taskId: string) => {
    const allTasks = await getTasks();
    const updatedTasks = allTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    await saveTasks(updatedTasks);
    loadData();
  };

  const toggleExpand = async (taskId: string) => {
    const allTasks = await getTasks();
    const updatedTasks = allTasks.map(task =>
      task.id === taskId ? { ...task, isExpanded: !task.isExpanded } : task
    );
    await saveTasks(updatedTasks);
    loadData();
  };

  const addSubtask = async (taskId: string, text: string) => {
    const allTasks = await getTasks();
    const updatedTasks = allTasks.map(task => {
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
    await saveTasks(updatedTasks);
    loadData();
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const allTasks = await getTasks();
    const updatedTasks = allTasks.map(task => {
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
    await saveTasks(updatedTasks);
    loadData();
  };

  const deleteTask = async (taskId: string) => {
    const allTasks = await getTasks();
    const updatedTasks = allTasks.filter(task => task.id !== taskId);
    await saveTasks(updatedTasks);
    loadData();
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const allTasks = await getTasks();
    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.filter(st => st.id !== subtaskId),
        };
      }
      return task;
    });
    await saveTasks(updatedTasks);
    loadData();
  };

  const togglePriority = async (taskId: string) => {
    const allTasks = await getTasks();
    const updatedTasks = allTasks.map(task =>
      task.id === taskId ? { ...task, priority: !task.priority } : task
    );
    await saveTasks(updatedTasks);
    loadData();
  };

  const toggleSubtaskPriority = async (taskId: string, subtaskId: string) => {
    const allTasks = await getTasks();
    const updatedTasks = allTasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(st =>
          st.id === subtaskId ? { ...st, priority: !st.priority } : st
        );
        const hasAnyPrioritySubtask = updatedSubtasks.some(st => st.priority);
        return {
          ...task,
          subtasks: updatedSubtasks,
          priority: hasAnyPrioritySubtask,
        };
      }
      return task;
    });
    await saveTasks(updatedTasks);
    loadData();
  };

  const renderCategory = (title: string, tasks: Task[]) => {
    if (tasks.length === 0) return null;

    return (
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <View style={styles.categoryLine} />
        </View>
        <View style={styles.tasksList}>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onToggleExpand={toggleExpand}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
              onDelete={deleteTask}
              onDeleteSubtask={deleteSubtask}
              onTogglePriority={togglePriority}
              onToggleSubtaskPriority={toggleSubtaskPriority}
            />
          ))}
        </View>
      </View>
    );
  };

  const totalPriorityTasks = workTasks.length + projectsTasks.length + lifeTasks.length + ownTasks.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PRIORITY TASKS</Text>
        <Text style={styles.headerSubtitle}>
          {totalPriorityTasks === 0 ? 'No priority tasks' : `${totalPriorityTasks} ${totalPriorityTasks === 1 ? 'task' : 'tasks'} to focus on`}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {totalPriorityTasks === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No priority tasks yet!</Text>
            <Text style={styles.emptySubtext}>Flag tasks to see them here</Text>
          </View>
        ) : (
          <>
            {renderCategory('WORK', workTasks)}
            {renderCategory('PROJECTS', projectsTasks)}
            {renderCategory('LIFE', lifeTasks)}
            {renderCategory('OWN', ownTasks)}
          </>
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
    backgroundColor: '#eb6f6f',
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
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Cute Dino',
    color: '#fffef7',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Cute Dino',
    color: '#fffef7',
    textAlign: 'center',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontFamily: 'Cute Dino',
    color: '#1d5564',
    letterSpacing: 1,
    marginBottom: 6,
  },
  categoryLine: {
    height: 2,
    backgroundColor: '#1d5564',
    opacity: 0.3,
  },
  tasksList: {
    gap: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 22,
    fontFamily: 'Cute Dino',
    color: '#1d5564',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Cute Dino',
    color: '#1d5564',
    opacity: 0.7,
  },
});
