import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { getTasks, updateTaskStatus, createTask, updateTask, deleteTask } from '../services/apiService';

export default function TaskCalendarScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');

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

  const openActionModal = (task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setActionModalVisible(true);
  };

  const closeActionModal = () => {
    setSelectedTask(null);
    setActionModalVisible(false);
  };

  const handleUpdateTask = async () => {
    if (!editTitle.trim() || !selectedTask) return;
    setTasks(prev => prev.map(t => t._id === selectedTask._id ? { ...t, title: editTitle } : t));
    await updateTask(selectedTask._id, { title: editTitle });
    closeActionModal();
    fetchTasks();
  };

  const handleMoveTask = async (quadrant) => {
    if (!selectedTask) return;
    setTasks(prev => prev.map(t => t._id === selectedTask._id ? { ...t, quadrant } : t));
    await updateTask(selectedTask._id, { quadrant });
    closeActionModal();
    fetchTasks();
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    setTasks(prev => prev.filter(t => t._id !== selectedTask._id));
    await deleteTask(selectedTask._id);
    closeActionModal();
    fetchTasks();
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
              onLongPress={() => openActionModal(t)}
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

      <Modal visible={isActionModalVisible} animationType="fade" transparent>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manage Task</Text>
                <TouchableOpacity onPress={closeActionModal}>
                  <Ionicons name="close-circle" size={28} color="#666" />
                </TouchableOpacity>
              </View>
              
              <TextInput 
                style={styles.modalInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Task title..."
                placeholderTextColor="#666"
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateTask}>
                <Text style={styles.saveBtnText}>Save Title</Text>
              </TouchableOpacity>

              <Text style={styles.sectionLabel}>MOVE TO QUADRANT</Text>
              <View style={styles.moveRow}>
                <TouchableOpacity style={[styles.moveBtn, { borderColor: '#FF3B30' }]} onPress={() => handleMoveTask('Q1')}>
                  <Text style={[styles.moveBtnText, { color: '#FF3B30' }]}>Q1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.moveBtn, { borderColor: '#34C759' }]} onPress={() => handleMoveTask('Q2')}>
                  <Text style={[styles.moveBtnText, { color: '#34C759' }]}>Q2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.moveBtn, { borderColor: '#FF9500' }]} onPress={() => handleMoveTask('Q3')}>
                  <Text style={[styles.moveBtnText, { color: '#FF9500' }]}>Q3</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.moveBtn, { borderColor: '#8E8E93' }]} onPress={() => handleMoveTask('Q4')}>
                  <Text style={[styles.moveBtnText, { color: '#8E8E93' }]}>Q4</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteTask}>
                <Ionicons name="trash" size={20} color="#FF3B30" />
                <Text style={styles.deleteBtnText}>Delete Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
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
  emptyText: { color: '#555', fontSize: 12, fontStyle: 'italic', marginTop: 8 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: '#333' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  modalInput: { backgroundColor: '#000', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16, marginBottom: 12 },
  saveBtn: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 24 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionLabel: { color: '#888', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 },
  moveRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  moveBtn: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginHorizontal: 4 },
  moveBtnText: { fontWeight: 'bold', fontSize: 16 },
  deleteBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 59, 48, 0.1)', borderRadius: 8, padding: 14 },
  deleteBtnText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }
});
