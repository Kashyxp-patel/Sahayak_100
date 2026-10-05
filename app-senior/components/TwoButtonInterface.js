import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
// import { Audio } from 'expo-av'; // Bypassed for Expo Go

export default function TwoButtonInterface() {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);

  // Local Shirva Emergency Contact (Mocked as police/clinic)
  const EMERGENCY_NUMBER = 'tel:112';

  async function startRecording() {
    try {
      console.log('[Mock] Starting recording..');
      // Bypassing expo-av encoder for Expo Go compatibility
      setRecording(true); // dummy recording state
      setIsRecording(true);
      console.log('[Mock] Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  const BACKEND_URL = 'https://untidy-oasis-gorgeous.ngrok-free.dev';

  async function stopRecording() {
    console.log('[Mock] Stopping recording..');
    setRecording(undefined);
    setIsRecording(false);
    
    if (!recording) return;

    const uri = "file:///dummy-audio-file-for-expo-go.m4a";
    console.log('[Mock] Recording stopped and stored at', uri);
    
    try {
      const formData = new FormData();
      formData.append('category', 'general'); // General category for big green button
      formData.append('seniorId', 'test-senior-123');
      formData.append('textMessage', '[Mock Audio Request - Main Button]'); 

      const response = await fetch(`${BACKEND_URL}/api/tasks/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      Alert.alert("Voice Note Sent!", "The local Shirva volunteers have received your request.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not connect to the backend server.");
    }
  }

  function handleEmergency() {
    Alert.alert(
      "EMERGENCY",
      "Calling local dispatcher now...",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => Linking.openURL(EMERGENCY_NUMBER) }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, styles.voiceButton, isRecording && styles.recordingActive]}
        onPressIn={startRecording}
        onPressOut={stopRecording}
      >
        <Text style={styles.buttonText}>
          {isRecording ? "Listening..." : "Hold to Speak"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.emergencyButton]}
        onPress={handleEmergency}
      >
        <Text style={styles.buttonText}>EMERGENCY</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 30,
    backgroundColor: '#F5F5F5',
  },
  button: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  voiceButton: {
    backgroundColor: '#4CAF50', // Big Green Button
  },
  recordingActive: {
    backgroundColor: '#45a049',
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  emergencyButton: {
    backgroundColor: '#F44336', // Big Red Button
    flex: 0.6, // Slightly smaller than the voice button to prevent accidental clicks
  },
  buttonText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
