import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ventAndExtractRule } from '../services/apiService';

const { width, height } = Dimensions.get('window');

export default function CaptureModal({ visible, onClose }) {
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  const handleSave = async () => {
    if (!entry.trim()) return;
    setLoading(true);
    try {
      await ventAndExtractRule(entry);
      setEntry('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalContent}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Quick Capture</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind? Did you spend money? Any new rules?"
              placeholderTextColor="#777"
              multiline
              autoFocus
              value={entry}
              onChangeText={setEntry}
              editable={!loading}
            />
            <View style={styles.footer}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Log to Aegis</Text>}
                {!loading && <Ionicons name="send" size={18} color="#fff" style={{marginLeft: 8}} />}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    color: '#fff',
    fontSize: 18,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  footer: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
