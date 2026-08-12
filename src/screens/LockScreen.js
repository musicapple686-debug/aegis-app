import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [correctPin, setCorrectPin] = useState('0000');
  const [shake] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchPin = async () => {
      try {
        const savedPin = await AsyncStorage.getItem('aegis_pin');
        if (savedPin) setCorrectPin(savedPin);
      } catch (e) {}
    };
    fetchPin();
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        // Shake animation for wrong PIN
        Animated.sequence([
          Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
        setTimeout(() => setPin(''), 300);
      }
    }
  }, [pin]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AEGIS</Text>
      <Text style={styles.subtitle}>AUTHORIZATION REQUIRED</Text>

      <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shake }] }]}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled]} />
        ))}
      </Animated.View>

      <TextInput
        style={styles.hiddenInput}
        value={pin}
        onChangeText={t => setPin(t.replace(/[^0-9]/g, '').slice(0, 4))}
        keyboardType="numeric"
        autoFocus
        caretHidden
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 42, fontWeight: 'bold', color: '#ffffff', marginBottom: 8, fontFamily: 'monospace', letterSpacing: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 40, fontFamily: 'monospace', letterSpacing: 2 },
  dotsContainer: { flexDirection: 'row', gap: 24 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#444', backgroundColor: 'transparent' },
  dotFilled: { backgroundColor: '#ffffff', borderColor: '#ffffff', shadowColor: '#fff', shadowOpacity: 0.5, shadowRadius: 5, shadowOffset: { width: 0, height: 0 } },
  hiddenInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%' }
});
