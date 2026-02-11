import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Flag } from 'lucide-react-native';
import ProgressBar from './ProgressBar';
import { Task, SubTask } from '@/utils/storage';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onToggleExpand: (taskId: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDelete: (taskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onTogglePriority?: (taskId: string) => void;
  onToggleSubtaskPriority?: (taskId: string, subtaskId: string) => void;
}

export default function TaskItem({
  task,
  onToggle,
  onToggleExpand,
  onAddSubtask,
  onToggleSubtask,
  onDelete,
  onDeleteSubtask,
  onTogglePriority,
  onToggleSubtaskPriority,
}: TaskItemProps) {
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      onAddSubtask(task.id, newSubtaskText.trim());
      setNewSubtaskText('');
    }
  };

  const handleAddSubtaskClick = () => {
    if (!task.isExpanded) {
      onToggleExpand(task.id);
    }
  };

  return (
    <View style={[styles.container, task.priority && styles.containerPriority]}>
      <View style={styles.taskRow}>
        <TouchableOpacity
          onPress={() => onToggle(task.id)}
          style={styles.checkbox}
        >
          <View style={[styles.checkboxInner, task.completed && styles.checkboxChecked]}>
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.textContainer}
          onPress={() => onToggleExpand(task.id)}
        >
          <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
            {task.text}
          </Text>
          {totalSubtasks > 0 && !task.isExpanded && (
            <View style={styles.miniProgressContainer}>
              <ProgressBar percentage={progress} height={7} />
              <Text style={styles.miniProgressText}>
                {completedSubtasks}/{totalSubtasks}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {totalSubtasks > 0 && (
          <TouchableOpacity
            onPress={() => onToggleExpand(task.id)}
            style={styles.expandButton}
          >
            {task.isExpanded ? (
              <ChevronDown size={20} color="#6b7280" />
            ) : (
              <ChevronRight size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
        )}

        {onTogglePriority && (
          <TouchableOpacity
            onPress={() => onTogglePriority(task.id)}
            style={[styles.priorityButton, task.priority && styles.priorityButtonActive]}
          >
            <Flag size={18} color={task.priority ? "#ffffff" : "#eb6f6f"} strokeWidth={3} fill={task.priority ? "#ffffff" : "transparent"} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleAddSubtaskClick} style={styles.addSubtaskButton}>
          <Plus size={20} color="#1d5564" strokeWidth={3} />
        </TouchableOpacity>

        {!task.isDaily && (
          <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteButton}>
            <Trash2 size={18} color="#ffffff" strokeWidth={3} />
          </TouchableOpacity>
        )}
      </View>

      {task.isExpanded && (
        <View style={styles.subtasksContainer}>
          {totalSubtasks > 0 && (
            <View style={styles.progressBarContainer}>
              <ProgressBar percentage={progress} height={6} />
              <Text style={styles.progressText}>
                {completedSubtasks}/{totalSubtasks} completed
              </Text>
            </View>
          )}

          {task.subtasks.map(subtask => (
            <View key={subtask.id} style={[styles.subtaskRow, subtask.priority && styles.subtaskRowPriority]}>
              <TouchableOpacity
                onPress={() => onToggleSubtask(task.id, subtask.id)}
                style={styles.subtaskCheckbox}
              >
                <View style={[styles.subtaskCheckboxInner, subtask.completed && styles.subtaskCheckboxChecked]}>
                  {subtask.completed && <Text style={styles.subtaskCheckmark}>✓</Text>}
                </View>
              </TouchableOpacity>

              <Text style={[styles.subtaskText, subtask.completed && styles.taskTextCompleted]}>
                {subtask.text}
              </Text>

              {onToggleSubtaskPriority && (
                <TouchableOpacity
                  onPress={() => onToggleSubtaskPriority(task.id, subtask.id)}
                  style={[styles.subtaskPriorityButton, subtask.priority && styles.subtaskPriorityButtonActive]}
                >
                  <Flag size={14} color={subtask.priority ? "#ffffff" : "#eb6f6f"} strokeWidth={3} fill={subtask.priority ? "#ffffff" : "transparent"} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => onDeleteSubtask(task.id, subtask.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={16} color="#ffffff" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addSubtaskContainer}>
            <TextInput
              style={styles.subtaskInput}
              placeholder="Add subtask..."
              placeholderTextColor="#9ca3af"
              value={newSubtaskText}
              onChangeText={setNewSubtaskText}
              onSubmitEditing={handleAddSubtask}
            />
            <TouchableOpacity onPress={handleAddSubtask} style={styles.addButton}>
              <Plus size={22} color="#ffffff" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffef7',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#1d5564',
    shadowColor: '#1d5564',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  containerPriority: {
    borderColor: '#eb6f6f',
    borderWidth: 4,
    shadowColor: '#eb6f6f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxInner: {
    width: 26,
    height: 26,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#1d5564',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffef7',
  },
  checkboxChecked: {
    backgroundColor: '#1d5564',
    borderColor: '#1d5564',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1d5564',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  miniProgressContainer: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '75%',
  },
  miniProgressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d5564',
  },
  expandButton: {
    padding: 6,
    marginLeft: 12,
  },
  priorityButton: {
    padding: 6,
    marginLeft: 8,
    backgroundColor: '#fffef7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#eb6f6f',
  },
  priorityButtonActive: {
    backgroundColor: '#eb6f6f',
    borderColor: '#eb6f6f',
  },
  addSubtaskButton: {
    padding: 6,
    marginLeft: 8,
    backgroundColor: '#f5e5b8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1d5564',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 8,
    backgroundColor: '#eb6f6f',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1d5564',
  },
  subtasksContainer: {
    marginTop: 16,
    marginLeft: 40,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d5564',
    marginTop: 6,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f5e5b8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  subtaskRowPriority: {
    borderColor: '#eb6f6f',
    backgroundColor: '#fff5f5',
  },
  subtaskCheckbox: {
    marginRight: 12,
  },
  subtaskCheckboxInner: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#1d5564',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffef7',
  },
  subtaskCheckboxChecked: {
    backgroundColor: '#1d5564',
    borderColor: '#1d5564',
  },
  subtaskCheckmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1d5564',
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: '#f5e5b8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#1d5564',
    borderWidth: 2,
    borderColor: '#1d5564',
  },
  addButton: {
    marginLeft: 10,
    padding: 6,
    backgroundColor: '#1d5564',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1d5564',
  },
  subtaskPriorityButton: {
    padding: 4,
    marginLeft: 6,
    backgroundColor: '#fffef7',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#eb6f6f',
  },
  subtaskPriorityButtonActive: {
    backgroundColor: '#eb6f6f',
    borderColor: '#eb6f6f',
  },
});
