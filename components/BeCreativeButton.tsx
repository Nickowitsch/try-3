import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { Task } from '@/utils/storage';

interface BeCreativeButtonProps {
  task: Task;
  onToggle: (taskId: string) => void;
}

export default function BeCreativeButton({ task, onToggle }: BeCreativeButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    onToggle(task.id);
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[
          styles.container,
          task.completed && styles.containerCompleted
        ]}
      >
        <Text style={[
          styles.text,
          task.completed && styles.textCompleted
        ]}>
          {task.completed ? '✓' : ''} Be creative
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffef7',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 4,
    borderColor: '#1d5564',
    shadowColor: '#1d5564',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerCompleted: {
    backgroundColor: '#1d5564',
    borderColor: '#1d5564',
  },
  text: {
    fontSize: 18,
    fontFamily: 'Cute Dino',
    color: '#1d5564',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  textCompleted: {
    color: '#fffef7',
  },
});
