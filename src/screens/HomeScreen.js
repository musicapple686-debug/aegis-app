import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getRules, getPatterns } from '../services/apiService';
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_COLORS = {
  'Work': '#FF9500',
  'Health': '#34C759',
  'Relationships': '#FF2D55',
  'Finances': '#AF52DE',
  'Mindfulness': '#30B0C7',
  'General': '#8E8E93'
};

export default function HomeScreen() {
  const [rules, setRules] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [error, setError] = useState(null);

  // Static Habits for UI Demo
  const [habits, setHabits] = useState([
    { id: 1, title: 'Drink 2L Water', done: false },
    { id: 2, title: 'Read 10 Pages', done: false },
    { id: 3, title: 'Morning Workout', done: true },
    { id: 4, title: 'No Social Media before 10 AM', done: true }
  ]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const storedRules = await getRules();
          setRules(storedRules);
          const storedPatterns = await getPatterns();
          setPatterns(storedPatterns);
        } catch(e) {
          setError(e.message);
        }
      };
      loadData();
    }, [])
  );

  const toggleHabit = (id) => {
    setHabits(habits.map(h => h.id === id ? { ...h, done: !h.done } : h));
  };

  const renderRuleItem = (item) => (
    <View key={item._id} style={styles.ruleCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.ruleTitle}>{item.title}</Text>
        <View style={[styles.tag, { backgroundColor: CATEGORY_COLORS[item.category || 'General'] || CATEGORY_COLORS['General'] }]}>
          <Text style={styles.tagText}>{item.category || 'General'}</Text>
        </View>
      </View>
      <Text style={styles.ruleDescription}>{item.description}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 100}}>
      
      {/* HEADER */}
      <View style={{ marginBottom: 32 }}>
        <Text style={styles.title}>Welcome back.</Text>
        <Text style={styles.subtitle}>Your personal Aegis system is online and ready.</Text>
      </View>

      {/* HABITS SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trending-up" size={24} color="#34C759" />
          <Text style={styles.sectionTitle}>Daily Habits</Text>
        </View>
        <View style={styles.habitsContainer}>
          {habits.map(habit => (
            <TouchableOpacity 
              key={habit.id} 
              style={[styles.habitCard, habit.done && styles.habitCardDone]} 
              onPress={() => toggleHabit(habit.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={habit.done ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={habit.done ? "#34C759" : "#666"} 
              />
              <Text style={[styles.habitText, habit.done && styles.habitTextDone]}>
                {habit.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* RULES SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="book" size={24} color="#AF52DE" />
          <Text style={styles.sectionTitle}>Operating Rules</Text>
        </View>
        
        {error && <Text style={{color: '#FF3B30', marginBottom: 10}}>Error: {error}</Text>}
        
        {rules.length === 0 ? (
          <Text style={styles.emptyText}>You haven't logged any experiences yet. Go vent in the Alter Ego tab to generate your first rule!</Text>
        ) : (
          rules.map(item => renderRuleItem(item))
        )}
      </View>

      {/* PATTERNS SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="warning" size={24} color="#FF2D55" />
          <Text style={[styles.sectionTitle, {color: '#FF2D55'}]}>Reality Checks</Text>
        </View>
        {patterns.length === 0 ? (
           <Text style={styles.emptyText}>No reality checks yet. The Alter Ego is still watching.</Text>
        ) : (
          patterns.map(p => (
            <View key={p._id} style={[styles.ruleCard, { borderLeftColor: '#FF2D55' }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.ruleTitle}>{p.title}</Text>
                <View style={[styles.tag, { backgroundColor: '#FF2D55' }]}>
                  <Text style={styles.tagText}>{p.vector}</Text>
                </View>
              </View>
              <Text style={styles.ruleDescription}>{p.description}</Text>
            </View>
          ))
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#aaaaaa' },
  
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginLeft: 8 },
  
  habitsContainer: { backgroundColor: '#1A1A1A', borderRadius: 12, overflow: 'hidden' },
  habitCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  habitCardDone: { opacity: 0.6 },
  habitText: { fontSize: 16, color: '#ffffff', marginLeft: 12 },
  habitTextDone: { color: '#888', textDecorationLine: 'line-through' },
  
  ruleCard: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#AF52DE' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  ruleTitle: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, flex: 1, paddingRight: 10 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  ruleDescription: { color: '#cccccc', fontSize: 14, lineHeight: 20 },
  
  emptyText: { color: '#666', fontSize: 15, fontStyle: 'italic' },
});
