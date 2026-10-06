import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

const BACKEND_URL = 'https://sahara-w2d3.onrender.com';
const VOLUNTEER_ID = 'test-volunteer-456';

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveTasks = async () => {
    try {
      // Pass tags=medical,essential to only see those, or leave empty to see all (except medical if filtered)
      // Since our dummy is medical certified, let's pass tags=medical,essential,travel,general
      const res = await fetch(`${BACKEND_URL}/api/tasks?tags=medical,essential,travel,general,other`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const json = await res.json();
      if (json.success) setTasks(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTasks();
    // Refresh every 10 seconds
    const interval = setInterval(fetchActiveTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayAudio = (taskId, audioUrl) => {
    if (!audioUrl) return;
    Alert.alert("Playing Audio...", `Streaming voice note from: ${audioUrl}`);
  };

  const handleAcceptTask = async (taskId) => {
    Alert.alert(
      "Accept Task?",
      "Are you sure you can complete this request?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: async () => {
            try {
              const res = await fetch(`${BACKEND_URL}/api/tasks/${taskId}/accept`, {
                method: 'PATCH',
                headers: { 
                  'Content-Type': 'application/json',
                  'ngrok-skip-browser-warning': 'true' 
                },
                body: JSON.stringify({ volunteerId: VOLUNTEER_ID })
              });
              if (res.ok) {
                Alert.alert("Task Accepted!", "This task has been moved to your 'My Tasks' dashboard.");
                fetchActiveTasks(); // Refresh board
              }
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Could not accept task.");
            }
          }
        }
      ]
    );
  };

  const renderTask = ({ item }) => (
    <View style={[styles.taskCard, item.status === 'ACCEPTED' && styles.taskAccepted]}>
      <View style={styles.taskHeader}>
        <Text style={styles.categoryBadge}>{item.category}</Text>
        <Text style={styles.timeText}>{new Date(item.created_at).toLocaleTimeString()}</Text>
      </View>
      
      {item.text_msg ? (
        <View style={styles.textMessageContainer}>
          <Text style={styles.textMessage}>"{item.text_msg}"</Text>
        </View>
      ) : null}
      
      <View style={styles.actionRow}>
        {item.audio_url && (
          <TouchableOpacity style={styles.playButton} onPress={() => handlePlayAudio(item.id, item.audio_url)}>
            <Text style={styles.buttonText}>▶ Voice Note</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'PENDING' && (
          <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptTask(item.id)}>
            <Text style={styles.buttonText}>Accept Task</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Live Help Requests</Text>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No active requests right now.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContainer: {
    padding: 15,
  },
  taskCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskAccepted: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: 'bold',
    fontSize: 14,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  textMessageContainer: {
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  textMessage: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  playButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
