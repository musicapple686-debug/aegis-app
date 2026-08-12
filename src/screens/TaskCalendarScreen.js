import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTasks, updateTaskStatus, createTask } from '../services/apiService';

export default function TaskCalendarScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    const data = await getTasks();
    setTasks(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const toggleTask = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    // Optimistic UI update
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
    await updateTaskStatus(id, newStatus);
    fetchTasks();
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setIsAdding(true);
    try {
      await createTask(newTaskTitle.trim(), 'everyday');
      setNewTaskTitle('');
      fetchTasks();
    } catch (e) {
      console.error(e);
      alert('Failed to add task.');
    } finally {
      setIsAdding(false);
    }
  };

  const getTaskColor = (type) => {
    switch (type) {
      case 'work': return '#007AFF';
      case 'important': return '#FF3B30';
      case 'everyday': return '#34C759';
      default: return '#AF52DE';
    }
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity 
      style={[styles.taskCard, { borderLeftColor: getTaskColor(item.type) }]} 
      onPress={() => toggleTask(item._id, item.status)}
    >
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, item.status === 'completed' && styles.taskCompleted]}>
          {item.title}
        </Text>
        <Text style={styles.taskType}>{item.type.toUpperCase()}</Text>
      </View>
      <Ionicons 
        name={item.status === 'completed' ? "checkmark-circle" : "ellipse-outline"} 
        size={24} 
        color={item.status === 'completed' ? "#34C759" : "#666"} 
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Protocol</Text>
        <Text style={styles.subtitle}>Prioritized by the Machine.</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task manually..."
          placeholderTextColor="#666"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleAddTask}
          editable={!isAdding}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask} disabled={isAdding || !newTaskTitle.trim()}>
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="add" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#007AFF" size="large" style={{ marginTop: 40 }} />
      ) : tasks.length === 0 ? (
        <Text style={styles.emptyText}>No tasks for today. You are free.</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item._id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 24, paddingTop: 0, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#aaaaaa' },
  listContainer: { paddingHorizontal: 24, paddingBottom: 100 },
  taskCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#1e1e1e', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    borderLeftWidth: 4
  },
  taskInfo: { flex: 1, paddingRight: 16 },
  taskTitle: { fontSize: 18, color: '#ffffff', fontWeight: '500', marginBottom: 4 },
  taskCompleted: { textDecorationLine: 'line-through', color: '#666' },
  taskType: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 16 },
  inputContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#1e1e1e', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  addButton: { width: 56, height: 56, backgroundColor: '#007AFF', borderRadius: 12, marginLeft: 12, justifyContent: 'center', alignItems: 'center' }
});
