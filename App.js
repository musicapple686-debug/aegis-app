import * as React from 'react';
import { View, TouchableOpacity, StyleSheet, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CaptureModal from './src/components/CaptureModal';
import SettingsModal from './src/components/SettingsModal';
import LockScreen from './src/screens/LockScreen';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';

import JournalScreen from './src/screens/JournalScreen';
import HomeScreen from './src/screens/HomeScreen';

import BetterMeScreen from './src/screens/BetterMeScreen';
import MirrorScreen from './src/screens/MirrorScreen';
import BrainScreen from './src/screens/BrainScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import FinanceScreen from './src/screens/FinanceScreen';
import TaskCalendarScreen from './src/screens/TaskCalendarScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [captureVisible, setCaptureVisible] = React.useState(false);
  const [settingsVisible, setSettingsVisible] = React.useState(false);
  const [isLocked, setIsLocked] = React.useState(true);
  const [isCheckingLock, setIsCheckingLock] = React.useState(true);
  const [accentColor, setAccentColor] = React.useState('#007AFF');

  React.useEffect(() => {
    const checkLock = async () => {
      try {
        const savedColor = await AsyncStorage.getItem('aegis_color');
        if (savedColor) setAccentColor(savedColor);
      } catch (e) {}
      setIsCheckingLock(false);
    };
    checkLock();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.match(/inactive|background/)) {
        setIsLocked(true);
      }
    });

    // Safe Foreground Telemetry Sync
    const syncTelemetry = async () => {
      try {
        const batteryLevel = await Battery.getBatteryLevelAsync();
        const networkState = await Network.getNetworkStateAsync();
        await fetch('http://54.209.56.53/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batteryLevel: batteryLevel >= 0 ? batteryLevel : 1,
            batteryState: 'unknown',
            networkType: networkState.type ? networkState.type.toLowerCase() : 'none',
            motionState: 'unknown'
          })
        });
      } catch (err) {}
    };

    syncTelemetry(); 
    const intervalId = setInterval(syncTelemetry, 60 * 1000); 

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, []);

  const handleUnlock = async () => {
    setIsLocked(false);
  };

  if (isCheckingLock) {
    return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;
  }

  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Tasks') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Alter Ego') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'The Brain') {
              iconName = focused ? 'git-network' : 'git-network-outline';
            } else if (route.name === 'Wallet') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Consult') {
              iconName = focused ? 'body' : 'body-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: accentColor,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'rgba(18, 18, 18, 0.7)',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
          },
          tabBarBackground: () => (
            <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
          ),
          headerStyle: {
            backgroundColor: '#121212',
            shadowColor: 'transparent',
            borderBottomWidth: 0,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => setSettingsVisible(true)} style={{ marginRight: 20 }}>
              <Ionicons name="settings" size={24} color="#666" />
            </TouchableOpacity>
          )
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Tasks" component={TaskCalendarScreen} />
        <Tab.Screen name="Wallet" component={FinanceScreen} />
        <Tab.Screen 
          name="Capture" 
          component={View} 
          options={{
            tabBarButton: (props) => {
              return (
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={props.style}
                  onPress={(e) => {
                    e.preventDefault();
                    setCaptureVisible(true);
                  }} 
                >
                  <View style={styles.fabContainer}>
                    <View style={[styles.fabGlow, { backgroundColor: accentColor, shadowColor: accentColor }]}>
                      <Ionicons name="add" size={32} color="#fff" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            },
          }}
        />
        <Tab.Screen name="Alter Ego" component={MirrorScreen} />
        <Tab.Screen name="The Brain" component={BrainScreen} />
      </Tab.Navigator>
      <CaptureModal visible={captureVisible} onClose={() => setCaptureVisible(false)} />
      <SettingsModal 
        visible={settingsVisible} 
        onClose={() => setSettingsVisible(false)} 
        accentColor={accentColor}
        setAccentColor={setAccentColor}
      />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  }
});
