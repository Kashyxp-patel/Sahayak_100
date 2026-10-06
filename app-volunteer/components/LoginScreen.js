import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess(userCredential.user);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        Alert.alert("Error", "Invalid email or password.");
      } else {
        Alert.alert("Error", err.message || "Could not login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess(userCredential.user);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message || "Could not sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sahayak Login</Text>
      
      <Text style={styles.subtitle}>{isSignUp ? 'Create an account to continue' : 'Enter your email to login'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={isSignUp ? handleSignUp : handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isSignUp ? 'Sign Up' : 'Login'}</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.switchButton} onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.switchText}>
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F5F5F5' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 10, fontSize: 18, marginBottom: 20 },
  button: { backgroundColor: '#FF9800', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchButton: { alignItems: 'center' },
  switchText: { color: '#2196F3', fontSize: 16 }
});
