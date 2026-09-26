import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Audio } from 'expo-av';

export default function TwoButtonInterface() {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);

  // Local Shirva Emergency Contact (Mocked as police/clinic)
  const EMERGENCY_NUMBER = 'tel:112';

  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    setIsRecording(false);
    
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    
    // Here we would upload the URI to our Node.js backend
    Alert.alert("Voice Note Sent!", "The local Shirva volunteers have received your request.");
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
