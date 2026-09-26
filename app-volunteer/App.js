import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import TaskBoard from './components/TaskBoard';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TaskBoard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
