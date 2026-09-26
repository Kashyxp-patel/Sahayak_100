import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Linking, ScrollView } from 'react-native';
import { Audio } from 'expo-av';

const CATEGORIES = [
  { id: 'medical', label: 'Medical', color: '#E53935', icon: '💊' },
  { id: 'essential', label: 'Essential', color: '#43A047', icon: '🛒' },
  { id: 'travel', label: 'Travel', color: '#1E88E5', icon: '🚗' },
  { id: 'volunteer', label: 'Volunteer', color: '#8E24AA', icon: '🤝' },
  { id: 'other', label: 'Other Issue', color: '#FB8C00', icon: '❓' },
  { id: 'emergency', label: 'EMERGENCY', color: '#b71c1c', icon: '🚨' },
];

export default function CategoryDashboard() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [textMessage, setTextMessage] = useState('');

  const EMERGENCY_NUMBER = 'tel:112';

  const handleCategoryPress = (category) => {
    if (category.id === 'emergency') {
      Alert.alert(
        "EMERGENCY",
        "Calling local dispatcher now...",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Call", onPress: () => Linking.openURL(EMERGENCY_NUMBER) }
        ]
      );
    } else {
      setSelectedCategory(category);
      setTextMessage('');
    }
  };

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setRecording(undefined);
    setIsRecording(false);
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped:', uri);
    Alert.alert("Voice Note Sent!", `Your ${selectedCategory.label} request has been sent to local volunteers.`);
    setSelectedCategory(null);
  }

  const handleSubmitText = () => {
    if (!textMessage.trim()) return;
    // Logic to send textMessage along with selectedCategory.id goes here
    Alert.alert("Text Sent!", `Your ${selectedCategory.label} text request has been sent to local volunteers.`);
    setSelectedCategory(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What do you need help with?</Text>
      
      <ScrollView contentContainerStyle={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat.id} 
            style={[styles.gridItem, { backgroundColor: cat.color }]}
            onPress={() => handleCategoryPress(cat)}
          >
            <Text style={styles.iconText}>{cat.icon}</Text>
            <Text style={styles.gridText}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pop-up Card for Audio/Text Input */}
      <Modal visible={!!selectedCategory} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedCategory?.label} Request</Text>
            
            <TouchableOpacity 
              style={[styles.micButton, isRecording && styles.recordingActive]}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Text style={styles.micIcon}>🎙️</Text>
              <Text style={styles.micHint}>
                {isRecording ? "Listening... Release to send" : "Hold to Record Voice"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.orText}>- OR -</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Type your message here..."
              value={textMessage}
              onChangeText={setTextMessage}
              multiline
            />
            
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedCategory(null)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendButton} onPress={handleSubmitText}>
                <Text style={styles.btnText}>Send Text</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#F5F5F5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { 
    width: '48%', 
    aspectRatio: 1, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 
  },
  iconText: { fontSize: 40, marginBottom: 10 },
  gridText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  micButton: { 
    width: 150, height: 150, borderRadius: 75, backgroundColor: '#4CAF50', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 10 
  },
  recordingActive: { backgroundColor: '#F44336', transform: [{ scale: 1.1 }] },
  micIcon: { fontSize: 50 },
  micHint: { color: 'white', fontWeight: 'bold', marginTop: 10, textAlign: 'center', paddingHorizontal: 10 },
  orText: { marginVertical: 15, fontSize: 16, color: '#666', fontWeight: 'bold' },
  textInput: { 
    width: '100%', height: 100, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, 
    padding: 15, fontSize: 16, textAlignVertical: 'top', marginBottom: 20 
  },
  actionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelButton: { flex: 1, backgroundColor: '#9E9E9E', padding: 15, borderRadius: 10, marginRight: 10, alignItems: 'center' },
  sendButton: { flex: 1, backgroundColor: '#2196F3', padding: 15, borderRadius: 10, marginLeft: 10, alignItems: 'center' },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
