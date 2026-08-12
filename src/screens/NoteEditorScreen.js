import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { createBrainNode } from '../services/apiService';
import { useNavigation } from '@react-navigation/native';

export default function NoteEditorScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await createBrainNode(title, content, 'note');
      setTitle('');
      setContent('');
      navigation.navigate('The Brain'); // Go to brain map to see it connect
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>New Note</Text>
      <Text style={styles.subheader}>Write down a thought. The AI will connect it to your Brain.</Text>

      <TextInput
        style={styles.inputTitle}
        placeholder="Title..."
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={styles.inputContent}
        placeholder="Start typing your thought..."
        placeholderTextColor="#666"
        multiline
        value={content}
        onChangeText={setContent}
        textAlignVertical="top"
      />

      <TouchableOpacity 
        style={[styles.button, (!title.trim() || !content.trim()) && styles.buttonDisabled]} 
        onPress={handleSave}
        disabled={loading || !title.trim() || !content.trim()}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Node</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 24,
  },
  inputTitle: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    fontSize: 18,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  inputContent: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    fontSize: 16,
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#333333',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
