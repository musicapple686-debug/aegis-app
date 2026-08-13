import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const ACCENT_COLORS = [
  { name: 'Aegis Blue', value: '#007AFF' },
  { name: 'Neon Green', value: '#34C759' },
  { name: 'Crimson', value: '#FF2D55' },
  { name: 'Deep Purple', value: '#AF52DE' },
  { name: 'Cyber Orange', value: '#FF9500' }
];

export default function SettingsModal({ visible, onClose, accentColor, setAccentColor }) {
  const [newPin, setNewPin] = useState('');
  const [pinSaved, setPinSaved] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (visible) {
      setNewPin('');
      setPinSaved(false);
    }
  }, [visible]);

  const handleSavePin = async () => {
    if (newPin.length === 4) {
      await AsyncStorage.setItem('aegis_pin', newPin);
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 2000);
      setNewPin('');
    } else {
      alert("PIN must be 4 digits.");
    }
  };

  const handleSaveColor = async (color) => {
    setAccentColor(color);
    await AsyncStorage.setItem('aegis_color', color);
  };

  const handleExportData = () => {
    let exportUrl = 'http://54.209.56.53/api/export?';
    if (startDate.trim()) exportUrl += `start=${startDate.trim()}&`;
    if (endDate.trim()) exportUrl += `end=${endDate.trim()}&`;
    
    Linking.openURL(exportUrl).catch(err => {
      console.error("Failed to open URL:", err);
      alert("Failed to export data.");
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>System Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={32} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security</Text>
              <Text style={styles.desc}>Update your 4-digit master lock PIN.</Text>
              <View style={styles.pinRow}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter new 4-digit PIN"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  value={newPin}
                  onChangeText={t => setNewPin(t.replace(/[^0-9]/g, ''))}
                />
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: accentColor }]} onPress={handleSavePin}>
                  <Text style={styles.saveBtnText}>{pinSaved ? 'Saved!' : 'Update PIN'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aesthetics</Text>
              <Text style={styles.desc}>Change the system accent color.</Text>
              <View style={styles.colorGrid}>
                {ACCENT_COLORS.map(c => (
                  <TouchableOpacity 
                    key={c.name}
                    style={[styles.colorBox, { backgroundColor: c.value, borderColor: accentColor === c.value ? '#fff' : c.value }]}
                    onPress={() => handleSaveColor(c.value)}
                  >
                    {accentColor === c.value && <Ionicons name="checkmark" size={24} color="#fff" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Management</Text>
              <Text style={styles.desc}>Download your God-Tier Master Journal. Includes 18 tabs containing your entire chronological timeline and all raw database collections.</Text>
              
              <View style={styles.dateRow}>
                <TextInput 
                  style={styles.dateInput} 
                  placeholder="Start (YYYY-MM-DD)"
                  placeholderTextColor="#666"
                  value={startDate}
                  onChangeText={setStartDate}
                />
                <TextInput 
                  style={styles.dateInput} 
                  placeholder="End (YYYY-MM-DD)"
                  placeholderTextColor="#666"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: '#FF9500', paddingVertical: 14, marginTop: 8 }]} 
                onPress={handleExportData}
              >
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                  <Ionicons name="download" size={20} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.saveBtnText}>Export Master Journal (.xlsx)</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(18,18,18,0.85)', padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  section: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  desc: { color: '#aaa', marginBottom: 16 },
  pinRow: { flexDirection: 'row', gap: 12 },
  input: { flex: 1, backgroundColor: '#121212', borderWidth: 1, borderColor: '#333', color: '#fff', padding: 12, borderRadius: 8, fontSize: 18, textAlign: 'center', letterSpacing: 4 },
  saveBtn: { justifyContent: 'center', paddingHorizontal: 20, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  colorBox: { width: 50, height: 50, borderRadius: 25, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  dateInput: { flex: 1, backgroundColor: '#121212', borderWidth: 1, borderColor: '#333', color: '#fff', padding: 12, borderRadius: 8, fontSize: 14, textAlign: 'center' }
});
