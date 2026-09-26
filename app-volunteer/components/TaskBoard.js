import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';

export default function TaskBoard() {
  const [tasks, setTasks] = useState([
    { id: '1', time: '2 mins ago', status: 'PENDING', category: 'Medical', text: '', hasAudio: true },
    { id: '2', time: '15 mins ago', status: 'PENDING', category: 'Essential', text: 'Need 1kg sugar and tea powder from market', hasAudio: false },
    { id: '3', time: '1 hour ago', status: 'ACCEPTED', category: 'Travel', text: '', hasAudio: true },
  ]);

  const handlePlayAudio = (taskId) => {
    Alert.alert("Playing Audio...", `Streaming Tulu voice note for task ${taskId}`);
  };

  const handleAcceptTask = (taskId) => {
    Alert.alert(
      "Accept Task?",
      "Are you sure you can complete this request?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: () => setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'ACCEPTED' } : t))
        }
      ]
    );
  };

  const renderTask = ({ item }) => (
    <View style={[styles.taskCard, item.status === 'ACCEPTED' && styles.taskAccepted]}>
      <View style={styles.taskHeader}>
        <Text style={styles.categoryBadge}>{item.category}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      
      {item.text ? (
        <View style={styles.textMessageContainer}>
          <Text style={styles.textMessage}>"{item.text}"</Text>
        </View>
      ) : null}
      
      <View style={styles.actionRow}>
        {item.hasAudio && (
          <TouchableOpacity style={styles.playButton} onPress={() => handlePlayAudio(item.id)}>
            <Text style={styles.buttonText}>▶ Play Voice Note</Text>
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
      <Text style={styles.headerTitle}>Active Help Requests (Shirva)</Text>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContainer}
      />
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
