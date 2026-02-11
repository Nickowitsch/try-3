import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import TaskItem from '@/components/TaskItem';
import { getTasks, saveTasks, Task } from '@/utils/storage';

export default function WorkScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  const loadData = async () => {
    const loadedTasks = await getTasks();
    const workTasks = loadedTasks.filter(t => t.category === 'work');
    const sortedTasks = workTasks.sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return 0;
    });
    setTasks(sortedTasks);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getCategoryProgress = () => {
    if (tasks.length === 0) return 0;

    let completedCount = 0;
    let totalCount = 0;

    tasks.forEach(task => {
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

  const addTask = async () => {
    if (!newTaskText.trim()) return;

    const allTasks = await getTasks();
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      subtasks: [],
      isExpanded: false,
      category: 'work',
    };

    const updatedTasks = [...allTasks, newTask];
    await saveTasks(updatedTasks);
    setNewTaskText('');
    loadData();
  };

  const toggleTask = async (taskId: string) => {
    const allTasks = await getTasks();
    const updatedTasks = allTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    await saveTasks(updatedTasks);
    loadData();
  };

  const toggleExpand = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, isExpanded: !task.isExpanded } : task
    );
    setTasks(updatedTasks);

    const allTasks = await getTasks();
    const updatedAllTasks = allTasks.map(task =>
      task.id === taskId ? { ...task, isExpanded: !task.isExpanded } : task
    );
    await saveTasks(updatedAllTasks);
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

  const progress = getCategoryProgress();

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress}%`, backgroundColor: '#5b9aa9' }
          ]}
        />
      </View>

      <View style={styles.addTaskContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add work task..."
          placeholderTextColor="#9ca3af"
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity onPress={addTask} style={styles.addButton}>
          <Plus size={28} color="#ffffff" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.tasksList}
        contentContainerStyle={styles.tasksListContent}
        showsVerticalScrollIndicator={false}
      >
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
  progressBarContainer: {
    height: 16,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#1d5564',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  addTaskContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#fffef7',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#1d5564',
    borderWidth: 3,
    borderColor: '#1d5564',
    shadowColor: '#1d5564',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  addButton: {
    backgroundColor: '#1d5564',
    borderRadius: 20,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1d5564',
    shadowColor: '#1d5564',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  tasksList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tasksListContent: {
    paddingBottom: 100,
  },
});
