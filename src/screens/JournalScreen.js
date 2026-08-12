import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ventAndExtractRule } from '../services/apiService';

export default function JournalScreen({ navigation }) {
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!entry.trim()) return;
    
    setLoading(true);
    try {
      const rule = await ventAndExtractRule(entry);
      
      if (rule && rule.title) {
        if (Platform.OS === 'web') {
           alert("New rule added to your Rule Book: " + rule.title);
        } else {
           Alert.alert("Insight Extracted!", `Added rule: ${rule.title}`);
        }
        setEntry('');
        navigation.navigate('Rule Book'); // Switch to Rules tab to see it
      }
    } catch (e) {
      console.error(e);
      if (Platform.OS === 'web') alert("API Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>What happened?</Text>
        <Text style={styles.subtitle}>Reflect on an experience, a decision, or your day. I'm listening.</Text>
        
        <TextInput
          style={styles.input}
          multiline
          placeholder="Start typing..."
          value={entry}
          onChangeText={setEntry}
          placeholderTextColor="#666"
          editable={!loading}
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log Experience</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scroll: { padding: 24, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#aaaaaa', marginBottom: 24 },
  input: { backgroundColor: '#1e1e1e', color: '#ffffff', borderRadius: 12, padding: 16, fontSize: 16, minHeight: 200, textAlignVertical: 'top', marginBottom: 24 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
