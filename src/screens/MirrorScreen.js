import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { mirrorChat, initMirror, transcribeAudio } from '../services/apiService';

export default function MirrorScreen() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const startChat = async () => {
      setLoading(true);
      const history = await initMirror();
      setChatLog(history);
      setLoading(false);
    };
    startChat();
  }, []);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        setIsRecording(true);
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
      } else {
        alert("Microphone permission required");
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    if (!recording) return;
    setLoading(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      let base64Audio;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        base64Audio = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      }

      const transcription = await transcribeAudio(base64Audio, Platform.OS === 'ios' ? 'audio/m4a' : 'audio/m4a');
      setMessage(prev => prev + (prev ? " " : "") + transcription);
    } catch (err) {
      console.error('Failed to stop recording or transcribe', err);
      alert("Failed to transcribe audio.");
    }
    setRecording(undefined);
    setLoading(false);
  }

  const handleSend = async () => {
    if (!message.trim()) return;
    
    // Add user message immediately
    const userMsg = { role: 'user', text: message };
    setChatLog(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const responseText = await mirrorChat(userMsg.text);
      setChatLog(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (e) {
      console.error(e);
      setChatLog(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to our memories." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Alter Ego</Text>
        <Text style={styles.subtitle}>You cannot hide from yourself.</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {chatLog.length === 0 ? (
          <Text style={styles.emptyText}>Initializing connection to your Alter Ego...</Text>
        ) : (
          chatLog.map((msg, index) => (
            <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.modelBubble]}>
              <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.modelText]}>{msg.text}</Text>
            </View>
          ))
        )}
        {loading && (
          <View style={[styles.messageBubble, styles.modelBubble]}>
             <ActivityIndicator color="#007AFF" size="small" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Say anything..."
          value={message}
          onChangeText={setMessage}
          placeholderTextColor="#666"
          editable={!loading && !isRecording}
        />
        <TouchableOpacity 
          style={[styles.micButton, isRecording && styles.micButtonRecording]} 
          onPressIn={startRecording} 
          onPressOut={stopRecording}
          disabled={loading}
        >
          <Ionicons name="mic" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading || isRecording}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 24, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#aaaaaa' },
  chatArea: { padding: 16, paddingBottom: 24, flexGrow: 1, justifyContent: 'flex-end' },
  emptyText: { color: '#666', fontSize: 16, textAlign: 'center', marginVertical: 40 },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  modelBubble: { alignSelf: 'flex-start', backgroundColor: '#1e1e1e', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#333' },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#ffffff' },
  modelText: { color: '#dddddd' },
  inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#222', backgroundColor: '#121212', paddingBottom: Platform.OS === 'ios' ? 100 : 80 },
  input: { flex: 1, backgroundColor: '#1e1e1e', color: '#ffffff', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, marginRight: 8 },
  micButton: { backgroundColor: '#333', borderRadius: 24, width: 48, height: 48, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  micButtonRecording: { backgroundColor: '#ff3b30' },
  sendButton: { backgroundColor: '#007AFF', borderRadius: 24, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});
