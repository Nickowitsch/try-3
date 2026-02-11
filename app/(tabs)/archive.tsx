import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import { getArchive, saveArchive, Task } from '@/utils/storage';

export default function ArchiveScreen() {
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadArchive = async () => {
        const archive = await getArchive();
        setArchivedTasks(archive.reverse());
      };
      loadArchive();
    }, [])
  );

  const clearArchive = async () => {
    Alert.alert(
      'CLEAR EVERYTHING?',
      'This will wipe all your archived tasks permanently!',
      [
        { text: 'Nah, Keep Em', style: 'cancel' },
        {
          text: 'DO IT',
          style: 'destructive',
          onPress: async () => {
            await saveArchive([]);
            setArchivedTasks([]);
          },
        },
      ]
    );
  };

  const deleteArchivedTask = async (taskId: string) => {
    const updatedArchive = archivedTasks.filter(task => task.id !== taskId);
    setArchivedTasks(updatedArchive);
    await saveArchive(updatedArchive);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DONE ZONE</Text>
        {archivedTasks.length > 0 && (
          <TouchableOpacity onPress={clearArchive} style={styles.clearButton}>
            <Trash2 size={22} color="#ffffff" strokeWidth={3} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.archiveList}
        contentContainerStyle={styles.archiveListContent}
        showsVerticalScrollIndicator={false}
      >
        {archivedTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nothing here yet!</Text>
            <Text style={styles.emptySubtext}>Finished tasks land here</Text>
          </View>
        ) : (
          archivedTasks.map(task => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskContent}>
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskText}>{task.text}</Text>
                  {task.subtasks.length > 0 && (
                    <View style={styles.subtasksInfo}>
                      {task.subtasks.map(subtask => (
                        <Text key={subtask.id} style={styles.subtaskText}>
                          • {subtask.text}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => deleteArchivedTask(task.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={18} color="#ffffff" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          ))
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Cute Dino',
    color: '#1d5564',
    letterSpacing: 0.5,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#eb6f6f',
    borderWidth: 3,
    borderColor: '#1d5564',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  archiveList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  archiveListContent: {
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
  taskCard: {
    backgroundColor: '#fffef7',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 3,
    borderColor: '#1d5564',
    shadowColor: '#1d5564',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#1d5564',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#1d5564',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d5564',
    marginBottom: 4,
  },
  subtasksInfo: {
    marginTop: 8,
    paddingLeft: 8,
  },
  subtaskText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d5564',
    marginBottom: 2,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 8,
    backgroundColor: '#eb6f6f',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1d5564',
  },
});
