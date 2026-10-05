import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Linking, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { Audio } from 'expo-av'; // Bypassed for Expo Go

const CATEGORIES = [
  { id: 'medical', label: 'Medical Help', color: '#EF4444', icon: 'medkit' },
  { id: 'essential', label: 'Groceries', color: '#10B981', icon: 'cart' },
  { id: 'travel', label: 'Transport', color: '#3B82F6', icon: 'car' },
  { id: 'volunteer', label: 'Company', color: '#8B5CF6', icon: 'people' },
  { id: 'other', label: 'Other', color: '#F59E0B', icon: 'apps' },
  { id: 'emergency', label: 'SOS 112', color: '#DC2626', icon: 'warning' },
];

export default function CategoryDashboard() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [textMessage, setTextMessage] = useState('');

  const EMERGENCY_NUMBER = 'tel:112';

  const handleCategoryPress = (category) => {
    if (category.id === 'emergency') {
      Linking.openURL(EMERGENCY_NUMBER);
    } else {
      setSelectedCategory(category);
      setTextMessage('');
    }
  };

  async function startRecording() {
    try {
      console.log('[Mock] Starting recording..');
      setRecording(true); // dummy recording state
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  const BACKEND_URL = 'https://sahara-w2d3.onrender.com';

  async function stopRecording() {
    setRecording(undefined);
    setIsRecording(false);
    if (!recording) return;
    
    const uri = "file:///dummy-audio-file-for-expo-go.m4a";
    console.log('[Mock] Recording stopped:', uri);
    
    try {
      const formData = new FormData();
      formData.append('category', selectedCategory.id);
      formData.append('seniorId', 'test-senior-123');
      formData.append('textMessage', '[Mock Audio Request]'); // Sending text since it's a mock

      const response = await fetch(`${BACKEND_URL}/api/tasks/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      Alert.alert("Voice Note Sent!", `Your ${selectedCategory.label} request has been sent to local volunteers.`);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not connect to the backend server.");
    }
    setSelectedCategory(null);
  }

  const handleSubmitText = async () => {
    if (!textMessage.trim()) return;
    
    try {
      const formData = new FormData();
      formData.append('category', selectedCategory.id);
      formData.append('seniorId', 'test-senior-123');
      formData.append('textMessage', textMessage);

      const response = await fetch(`${BACKEND_URL}/api/tasks/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      Alert.alert("Text Sent!", `Your ${selectedCategory.label} text request has been sent to local volunteers.`);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not connect to the backend server.");
    }
    setSelectedCategory(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What do you need help with?</Text>
      <Text style={styles.subtitle}>Tap a category to request assistance.</Text>
      
      <ScrollView contentContainerStyle={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat.id} 
            style={[styles.gridItem, { backgroundColor: cat.color }]}
            onPress={() => handleCategoryPress(cat)}
            activeOpacity={0.8}
          >
            <Ionicons name={cat.icon} size={42} color="white" style={styles.iconMargin} />
            <Text style={styles.gridText}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pop-up Card for Audio/Text Input */}
      <Modal visible={!!selectedCategory} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCategory?.label} Request</Text>
              <Ionicons name={selectedCategory?.icon} size={28} color={selectedCategory?.color} />
            </View>
            
            <TouchableOpacity 
              style={[styles.micButton, isRecording && styles.recordingActive]}
              onPressIn={startRecording}
              onPressOut={stopRecording}
              activeOpacity={0.9}
            >
              <Ionicons name="mic" size={54} color="white" />
              <Text style={styles.micHint}>
                {isRecording ? "Listening... Release to send" : "Hold to Record Voice"}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Type your specific message here..."
              placeholderTextColor="#94A3B8"
              value={textMessage}
              onChangeText={setTextMessage}
              multiline
            />
            
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedCategory(null)}>
                <Text style={styles.btnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendButton} onPress={handleSubmitText}>
                <Text style={styles.btnTextLight}>Send Request</Text>
                <Ionicons name="send" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 10 },
  subtitle: { fontSize: 15, color: '#64748B', marginBottom: 25, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 40 },
  gridItem: { 
    width: '47%', 
    aspectRatio: 1, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 10, 
    elevation: 8 
  },
  iconMargin: { marginBottom: 12 },
  gridText: { color: 'white', fontSize: 17, fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'center', padding: 20 },
  modalCard: { 
    backgroundColor: 'white', 
    borderRadius: 28, 
    padding: 24, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  
  micButton: { 
    width: 160, height: 160, borderRadius: 80, backgroundColor: '#10B981', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8
  },
  recordingActive: { backgroundColor: '#EF4444', transform: [{ scale: 1.05 }], shadowColor: '#EF4444' },
  micHint: { color: 'white', fontWeight: '700', marginTop: 12, textAlign: 'center', paddingHorizontal: 15, fontSize: 13 },
  
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  orText: { marginHorizontal: 15, fontSize: 14, color: '#94A3B8', fontWeight: 'bold' },
  
  textInput: { 
    width: '100%', height: 110, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', 
    borderRadius: 16, padding: 16, fontSize: 16, textAlignVertical: 'top', marginBottom: 24, color: '#0F172A'
  },
  
  actionRow: { flexDirection: 'row', width: '100%', gap: 12 },
  cancelButton: { flex: 1, backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, alignItems: 'center' },
  sendButton: { flex: 1.5, backgroundColor: '#0EA5E9', padding: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  btnTextDark: { color: '#475569', fontSize: 16, fontWeight: 'bold' },
  btnTextLight: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
