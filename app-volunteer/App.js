import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import TaskBoard from './components/TaskBoard';
import LoginScreen from './components/LoginScreen';
import CompleteProfile from './components/CompleteProfile';

const BACKEND_URL = 'https://sahara-w2d3.onrender.com';
const PRIMARY_COLOR = '#4F46E5'; // Energetic Indigo

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  const [profileVisible, setProfileVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [myTasks, setMyTasks] = useState([]);

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          fetch(`${BACKEND_URL}/api/users/volunteer/test-volunteer-456/push-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          }).catch(console.error);
        }
      });
    }
  }, [user]);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'b0e01479-7a6c-4b5b-80fb-13c58ccaf9e5' // Placeholder EAS project ID
      })).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  }

  const fetchMyTasks = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tasks/volunteer/test-volunteer-456`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const json = await res.json();
      if (json.success) setMyTasks(json.data);
      setHistoryVisible(true);
    } catch (err) {
      console.error(err);
      alert("Could not fetch tasks");
    }
  };

  const handleFinishTask = async (taskId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        Alert.alert("Success", "Task marked as completed!");
        fetchMyTasks(); // refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={(u) => setUser(u)} />;
  }

  if (!hasProfile) {
    return <CompleteProfile user={user} onProfileComplete={(data) => setHasProfile(true)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Volunteer Mode</Text>
          <Text style={styles.headerText}>Sahara Tasks</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={fetchMyTasks} style={styles.iconBtn}>
            <Ionicons name="clipboard-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setProfileVisible(true)} style={styles.iconBtn}>
            <Ionicons name="person-circle-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <TaskBoard />

      {/* PROFILE MODAL */}
      <Modal visible={profileVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Profile</Text>
              <Ionicons name="shield-checkmark" size={24} color={PRIMARY_COLOR} />
            </View>
            
            <View style={styles.profileContent}>
              <View style={styles.profileRow}><Text style={styles.label}>Name</Text><Text style={styles.value}>Test Volunteer</Text></View>
              <View style={styles.profileRow}><Text style={styles.label}>Phone</Text><Text style={styles.value}>+91 0987654321</Text></View>
              <View style={styles.profileRow}><Text style={styles.label}>Verified</Text><Text style={[styles.value, {color: '#059669'}]}>Yes</Text></View>
              <View style={styles.profileRow}><Text style={styles.label}>Medical Tag</Text><Text style={[styles.value, {color: '#DC2626'}]}>Yes</Text></View>
            </View>
            
            <TouchableOpacity style={styles.closeBtn} onPress={() => setProfileVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MY TASKS MODAL */}
      <Modal visible={historyVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { height: '80%', padding: 0 }]}>
            <View style={[styles.modalHeader, { padding: 20, borderBottomWidth: 1, borderColor: '#F1F5F9' }]}>
              <Text style={styles.modalTitle}>My Tasks</Text>
              <Ionicons name="list-circle" size={26} color={PRIMARY_COLOR} />
            </View>
            <FlatList
              data={myTasks}
              keyExtractor={item => item.id}
              contentContainerStyle={{ padding: 20 }}
              style={{ width: '100%' }}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  <View style={styles.historyHeaderRow}>
                    <Text style={styles.historyCat}>{item.category.toUpperCase()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'ACCEPTED' ? '#DBEAFE' : '#D1FAE5' }]}>
                      <Text style={[styles.statusText, { color: item.status === 'ACCEPTED' ? '#1D4ED8' : '#047857' }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyDate}>
                    <Ionicons name="calendar-outline" size={12} /> {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                  
                  {item.status === 'ACCEPTED' && (
                    <TouchableOpacity style={styles.finishBtn} onPress={() => handleFinishTask(item.id)}>
                      <Ionicons name="checkmark-done-circle" size={20} color="white" />
                      <Text style={styles.btnText}>Mark as Finished</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              ListEmptyComponent={
                <View style={{alignItems: 'center', padding: 30}}>
                  <Ionicons name="checkmark-circle-outline" size={50} color="#ccc" />
                  <Text style={{color: '#888', marginTop: 10, fontSize: 16}}>No tasks accepted yet.</Text>
                </View>
              }
            />
            <View style={{ padding: 20, borderTopWidth: 1, borderColor: '#F1F5F9' }}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setHistoryVisible(false)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 20, 
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 10
  },
  headerGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  headerText: { fontSize: 26, fontWeight: 'bold', color: 'white' },
  headerIcons: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', padding: 20 },
  modalCard: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  
  profileContent: { padding: 20, paddingTop: 0 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  label: { fontWeight: '600', color: '#64748B', fontSize: 15 },
  value: { fontWeight: '700', color: '#0F172A', fontSize: 15 },
  
  closeBtn: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, alignItems: 'center' },
  closeBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 16 },
  
  historyCard: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  historyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyCat: { fontWeight: '800', fontSize: 16, color: '#0F172A', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  historyDate: { color: '#64748B', fontSize: 13, marginTop: 6, fontWeight: '500', marginBottom: 12 },
  
  finishBtn: { 
    backgroundColor: '#10B981', 
    padding: 12, 
    borderRadius: 12, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});
