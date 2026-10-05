import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import TaskBoard from './components/TaskBoard';
import LoginScreen from './components/LoginScreen';
import CompleteProfile from './components/CompleteProfile';

const BACKEND_URL = 'https://untidy-oasis-gorgeous.ngrok-free.dev';

export default function App() {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  const [profileVisible, setProfileVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [myTasks, setMyTasks] = useState([]);

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
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setProfileVisible(true)} style={styles.iconBtn}>
            <Text style={styles.icon}>👤 Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchMyTasks} style={styles.iconBtn}>
            <Text style={styles.icon}>📋 My Tasks</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>Volunteer</Text>
      </View>

      <TaskBoard />

      {/* PROFILE MODAL */}
      <Modal visible={profileVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Volunteer Profile</Text>
            <View style={styles.profileRow}><Text style={styles.label}>Name:</Text><Text>Test Volunteer</Text></View>
            <View style={styles.profileRow}><Text style={styles.label}>Phone:</Text><Text>+91 0987654321</Text></View>
            <View style={styles.profileRow}><Text style={styles.label}>Verified:</Text><Text>Yes</Text></View>
            <View style={styles.profileRow}><Text style={styles.label}>Medical Tag:</Text><Text>Yes</Text></View>
            
            <TouchableOpacity style={styles.closeBtn} onPress={() => setProfileVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MY TASKS MODAL */}
      <Modal visible={historyVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>My Tasks (History)</Text>
            <FlatList
              data={myTasks}
              keyExtractor={item => item.id}
              style={{ width: '100%', maxHeight: 400 }}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  <Text style={styles.historyCat}>{item.category.toUpperCase()}</Text>
                  <Text style={styles.historyStatus}>Status: {item.status}</Text>
                  <Text style={styles.historyDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  
                  {item.status === 'ACCEPTED' && (
                    <TouchableOpacity style={styles.finishBtn} onPress={() => handleFinishTask(item.id)}>
                      <Text style={styles.btnText}>Finish Task</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              ListEmptyComponent={<Text>No tasks accepted yet.</Text>}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setHistoryVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconBtn: { padding: 5, backgroundColor: '#e3f2fd', borderRadius: 8, paddingHorizontal: 10 },
  icon: { fontSize: 14, color: '#1976d2', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  profileRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  label: { fontWeight: 'bold', color: '#555' },
  closeBtn: { marginTop: 20, backgroundColor: '#E53935', padding: 10, borderRadius: 10, width: '100%', alignItems: 'center' },
  closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  historyCard: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee', width: '100%' },
  historyCat: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  historyStatus: { color: '#00796b', marginTop: 5 },
  historyDate: { color: '#888', fontSize: 12, marginTop: 5 },
  finishBtn: { marginTop: 10, backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
