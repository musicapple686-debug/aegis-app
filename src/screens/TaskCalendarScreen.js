import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
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

  const renderQuadrant = (title, qTasks, bgCol, borderCol) => (
    <View style={[styles.quadrant, { backgroundColor: bgCol, borderColor: borderCol }]}>
      <Text style={[styles.quadTitle, { color: borderCol }]}>{title}</Text>
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {qTasks.length === 0 ? (
          <Text style={styles.emptyText}>Clear.</Text>
        ) : (
          qTasks.map(t => (
            <TouchableOpacity 
              key={t._id} 
              style={[styles.taskItem]} 
              onPress={() => toggleTask(t._id, t.status)}
            >
              <Ionicons 
                name={t.status === 'completed' ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={t.status === 'completed' ? borderCol : "#666"} 
              />
              <Text style={[styles.taskText, t.status === 'completed' && { textDecorationLine: 'line-through', color: '#666' }]}>
                {t.title}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  const q1Tasks = tasks.filter(t => t.quadrant === 'Q1');
  const q2Tasks = tasks.filter(t => t.quadrant === 'Q2' || !t.quadrant); 
  const q3Tasks = tasks.filter(t => t.quadrant === 'Q3');
  const q4Tasks = tasks.filter(t => t.quadrant === 'Q4');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Priority Matrix</Text>
        <Text style={styles.subtitle}>Tasks automatically sorted by Aegis AI.</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Log a task. Aegis will place it..."
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

      <View style={styles.matrixContainer}>
        <View style={styles.matrixRow}>
          {renderQuadrant("DO (Q1)", q1Tasks, "rgba(255, 59, 48, 0.1)", "#FF3B30")}
          {renderQuadrant("SCHEDULE (Q2)", q2Tasks, "rgba(52, 199, 89, 0.1)", "#34C759")}
        </View>
        <View style={styles.matrixRow}>
          {renderQuadrant("DELEGATE (Q3)", q3Tasks, "rgba(255, 149, 0, 0.1)", "#FF9500")}
          {renderQuadrant("ELIMINATE (Q4)", q4Tasks, "rgba(142, 142, 147, 0.1)", "#8E8E93")}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60, paddingHorizontal: 16 },
  header: { marginBottom: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: '#888', fontSize: 14, fontWeight: '600', marginTop: 4 },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  addButton: { width: 56, height: 56, backgroundColor: '#FF2D55', borderRadius: 12, marginLeft: 12, justifyContent: 'center', alignItems: 'center' },
  matrixContainer: { flex: 1, marginBottom: 80 }, 
  matrixRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  quadrant: { flex: 0.48, borderRadius: 16, padding: 12, borderWidth: 1 },
  quadTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  taskItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  taskText: { color: '#fff', fontSize: 13, marginLeft: 8, flex: 1 },
  emptyText: { color: '#555', fontSize: 12, fontStyle: 'italic', marginTop: 8 }
});
