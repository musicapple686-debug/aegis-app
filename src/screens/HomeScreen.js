import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getRules, getPatterns, getHabitStreaks } from '../services/apiService';
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

  // Dynamic Habits
  const [habits, setHabits] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const storedRules = await getRules();
          setRules(storedRules);
          const storedPatterns = await getPatterns();
          setPatterns(storedPatterns);
          const storedHabits = await getHabitStreaks();
          setHabits(storedHabits);
        } catch(e) {
          setError(e.message);
        }
      };
      loadData();
    }, [])
  );

  const toggleHabit = (id) => {
    // Habits are logged via Alter Ego or Quick Capture. Toggling here isn't supported yet, 
    // but we can add optimistic UI or leave it view-only since Alter Ego tracks it.
    // Let's leave it view only for now since tracking is dynamic.
  };

  const renderRuleItem = (item) => (
    <View key={item._id} style={[styles.ruleCard, item.isRecommended && { borderColor: '#FF2D55', borderWidth: 1 }]}>
      <View style={styles.cardHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          {item.isRecommended && <Ionicons name="flash" size={16} color="#FF2D55" style={{marginRight: 6}} />}
          <Text style={[styles.ruleTitle, item.isRecommended && {color: '#FF2D55'}]}>{item.title}</Text>
        </View>
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
          {habits.length === 0 ? (
            <Text style={[styles.emptyText, {padding: 16}]}>No habits tracked yet. The Alter Ego will monitor them.</Text>
          ) : (
            habits.map(habit => (
              <View 
                key={habit.id} 
                style={[styles.habitCard, habit.doneToday && styles.habitCardDone]} 
              >
                <Ionicons 
                  name={habit.doneToday ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={habit.doneToday ? "#34C759" : "#666"} 
                />
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Text style={[styles.habitText, habit.doneToday && styles.habitTextDone]}>
                    {habit.title}
                  </Text>
                  
                  {habit.type === 'good' ? (
                    <View style={styles.streakBadge}>
                      <Text style={styles.streakEmoji}>🔥</Text>
                      <Text style={styles.streakText}>{habit.currentStreak} Day{habit.currentStreak !== 1 && 's'}</Text>
                    </View>
                  ) : (
                    <View style={styles.shieldBadge}>
                      <Text style={styles.shieldEmoji}>🛡️</Text>
                      <Text style={styles.shieldText}>{habit.daysClean} Clean</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
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
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4a2511', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  streakEmoji: { fontSize: 12, marginRight: 4 },
  streakText: { color: '#ff9500', fontWeight: 'bold', fontSize: 12 },
  shieldBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a3a2a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  shieldEmoji: { fontSize: 12, marginRight: 4 },
  shieldText: { color: '#34c759', fontWeight: 'bold', fontSize: 12 },
});
