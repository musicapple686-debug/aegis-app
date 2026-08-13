import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

export default function GodProfileScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [truthSerumVisible, setTruthSerumVisible] = useState(false);
  const [truthSerumAnswered, setTruthSerumAnswered] = useState(false);
  const [accentColor, setAccentColor] = useState('#FF2D55');

  const fetchProfile = async () => {
    try {
      const color = await AsyncStorage.getItem('aegis_color');
      if (color) setAccentColor(color);

      const isWebProd = Platform.OS === 'web' && process.env.NODE_ENV === 'production';
      const API_URL = isWebProd ? '' : 'http://54.209.56.53';
      const res = await fetch(`${API_URL}/api/god-profile`);
      const json = await res.json();
      setData(json);

      // Check if truth serum was answered today
      const lastAnswer = await AsyncStorage.getItem('truth_serum_date');
      const today = new Date().toDateString();
      if (lastAnswer !== today) {
        setTruthSerumVisible(true);
      } else {
        setTruthSerumAnswered(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const submitTruthSerum = async () => {
    await AsyncStorage.setItem('truth_serum_date', new Date().toDateString());
    setTruthSerumVisible(false);
    setTruthSerumAnswered(true);
  };

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF2D55" />
        <Text style={styles.loadingText}>Connecting to God Engine...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>DOPAMINE ADDICT</Text>
          <Text style={styles.subtitle}>Level 1 | Ascendant Protocol Active</Text>
        </View>
        <TouchableOpacity 
          style={styles.panicButton} 
          onPress={() => navigation.navigate('Tasks')}
        >
          <Ionicons name="warning" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Predictive Alerts */}
        <View style={styles.alertBox}>
          <Ionicons name="flash" size={24} color="#FF9500" />
          <Text style={styles.alertText}>{data.predictiveFailure}</Text>
        </View>

        {/* RPG Stats */}
        <Text style={styles.sectionTitle}>RPG STATS</Text>
        <View style={styles.statsCard}>
          <StatBar name="DISCIPLINE (VIT)" value={data.stats.discipline} color="#FF2D55" />
          <StatBar name="FOCUS (INT)" value={data.stats.focus} color="#007AFF" />
          <StatBar name="WEALTH (GP)" value={data.stats.wealth} color="#34C759" />
          <StatBar name="RESILIENCE (DEF)" value={data.stats.resilience} color="#AF52DE" />
        </View>

        {/* Visual Analytics */}
        <Text style={styles.sectionTitle}>VISUAL ANALYTICS</Text>
        <View style={styles.statsCard}>
          
          <Text style={styles.statName}>DOPAMINE VS DISCIPLINE</Text>
          <Text style={{color: '#888', fontSize: 10, marginBottom: 8}}>Tasks Completed vs Vents/Complaints</Text>
          <View style={{flexDirection: 'row', height: 20, borderRadius: 10, overflow: 'hidden', marginBottom: 24}}>
            <View style={{flex: data.raw.completedTasks || 0.1, backgroundColor: '#34C759', justifyContent: 'center', paddingLeft: 8}}>
              <Text style={{color: '#000', fontWeight: 'bold', fontSize: 10}}>{data.raw.completedTasks} Tasks</Text>
            </View>
            <View style={{flex: data.raw.ventsCount || 0.1, backgroundColor: '#FF2D55', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 8}}>
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 10}}>{data.raw.ventsCount} Vents</Text>
            </View>
          </View>

          <Text style={styles.statName}>FINANCIAL BURN RATE</Text>
          <Text style={{color: '#888', fontSize: 10, marginBottom: 8}}>Total Income vs Junk Food/Shopping</Text>
          <View style={{flexDirection: 'row', height: 20, borderRadius: 10, overflow: 'hidden', marginBottom: 8}}>
            <View style={{flex: data.raw.income || 0.1, backgroundColor: '#007AFF', justifyContent: 'center', paddingLeft: 8}}>
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 10}}>${data.raw.income}</Text>
            </View>
            <View style={{flex: data.raw.junkSpend || 0.1, backgroundColor: '#FF9500', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 8}}>
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 10}}>${data.raw.junkSpend}</Text>
            </View>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Lost Time Clock</Text>
            <Text style={[styles.metricValue, { color: '#FF2D55' }]}>{data.metrics.lostTimeHours} hrs</Text>
            <Text style={styles.metricSub}>Doomscrolling > 1AM</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Talk/Action Ratio</Text>
            <Text style={[styles.metricValue, { color: '#007AFF' }]}>{data.metrics.actionToTalk}</Text>
            <Text style={styles.metricSub}>Words typed per 1 task</Text>
          </View>
        </View>

        {/* The Mirror */}
        <Text style={styles.sectionTitle}>THE MIRROR (Psychiatric Eval)</Text>
        <View style={styles.mirrorCard}>
          <Text style={styles.mirrorText}>{data.mirrorEval}</Text>
        </View>
      </ScrollView>

      {/* The Excuses Graveyard Marquee */}
      <View style={styles.graveyard}>
        <Text style={styles.graveyardText} numberOfLines={1}>
          "I'll do it tomorrow." • "I'm too tired." • "Just 5 more minutes." • "It's not my fault." • "I need a break."
        </Text>
      </View>

      {/* Truth Serum Modal */}
      <Modal visible={truthSerumVisible} animationType="fade" transparent>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.truthModal}>
            <Ionicons name="skull" size={64} color="#FF2D55" />
            <Text style={styles.truthTitle}>TRUTH SERUM PROTOCOL</Text>
            <Text style={styles.truthQuestion}>{data.truthSerum}</Text>
            <TouchableOpacity style={styles.truthBtn} onPress={submitTruthSerum}>
              <Text style={styles.truthBtnText}>I Accept Reality</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

const StatBar = ({ name, value, color }) => (
  <View style={styles.statContainer}>
    <View style={styles.statHeader}>
      <Text style={styles.statName}>{name}</Text>
      <Text style={styles.statValue}>{value}/100</Text>
    </View>
    <View style={styles.barBackground}>
      <View style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FF2D55', marginTop: 16, fontSize: 18, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: '#666', fontSize: 14, fontWeight: '600' },
  panicButton: { backgroundColor: '#FF2D55', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#FF2D55', shadowOpacity: 0.8, shadowRadius: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  alertBox: { backgroundColor: 'rgba(255, 149, 0, 0.1)', borderColor: '#FF9500', borderWidth: 1, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  alertText: { color: '#FF9500', fontSize: 14, fontWeight: 'bold', marginLeft: 12, flex: 1 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 12, letterSpacing: 1 },
  statsCard: { backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#333' },
  statContainer: { marginBottom: 16 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statName: { color: '#aaa', fontSize: 12, fontWeight: 'bold' },
  statValue: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  barBackground: { height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  metricCard: { flex: 0.48, backgroundColor: '#111', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  metricLabel: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  metricValue: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  metricSub: { color: '#555', fontSize: 10 },
  mirrorCard: { backgroundColor: '#111', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333', marginBottom: 24 },
  mirrorText: { color: '#00ff41', fontFamily: 'monospace', fontSize: 14, lineHeight: 22 },
  graveyard: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FF2D55', paddingVertical: 12 },
  graveyardText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 2, textAlign: 'center' },
  truthModal: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  truthTitle: { color: '#FF2D55', fontSize: 24, fontWeight: '900', marginTop: 24, marginBottom: 16, textAlign: 'center' },
  truthQuestion: { color: '#fff', fontSize: 20, fontWeight: '600', textAlign: 'center', lineHeight: 30, marginBottom: 40 },
  truthBtn: { backgroundColor: '#FF2D55', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  truthBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
