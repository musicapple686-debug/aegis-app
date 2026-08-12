import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { consultBetterMe } from '../services/apiService';

export default function BetterMeScreen() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConsult = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const aiResponse = await consultBetterMe(query);
      setResponse(aiResponse);
    } catch (e) {
      console.error(e);
      setResponse("Connection error.");
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
        <Text style={styles.title}>Better Me</Text>
        <Text style={styles.subtitle}>Consult your higher self before making a decision.</Text>
        
        <TextInput
          style={styles.input}
          multiline
          placeholder="I'm about to..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#666"
          editable={!loading}
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleConsult}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Consult</Text>}
        </TouchableOpacity>

        {response ? (
          <View style={styles.responseContainer}>
            <Text style={styles.responseLabel}>Insight:</Text>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scroll: { padding: 24, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#aaaaaa', marginBottom: 24 },
  input: { backgroundColor: '#1e1e1e', color: '#ffffff', borderRadius: 12, padding: 16, fontSize: 16, minHeight: 120, textAlignVertical: 'top', marginBottom: 24 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  responseContainer: { backgroundColor: 'rgba(0, 122, 255, 0.1)', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 122, 255, 0.3)' },
  responseLabel: { color: '#007AFF', fontWeight: 'bold', marginBottom: 8, fontSize: 14, textTransform: 'uppercase' },
  responseText: { color: '#ffffff', fontSize: 16, lineHeight: 24 }
});
