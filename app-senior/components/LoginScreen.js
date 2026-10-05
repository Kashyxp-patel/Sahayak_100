import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import app from '../firebaseConfig'; // To get the config object

export default function LoginScreen({ onLoginSuccess }) {
  const recaptchaVerifier = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const sendVerification = async () => {
    try {
      setLoading(true);
      
      // Remove any spaces the user might have typed by accident
      const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');

      const phoneProvider = new PhoneAuthProvider(auth);
      const id = await phoneProvider.verifyPhoneNumber(
        cleanPhoneNumber,
        recaptchaVerifier.current
      );
      setVerificationId(id);
      Alert.alert("SMS Sent!", "Check your messages for the OTP.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message || "Could not send SMS.");
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async () => {
    try {
      setLoading(true);
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const userCredential = await signInWithCredential(auth, credential);
      // Success! Pass the user up to App.js
      onLoginSuccess(userCredential.user);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Invisible Recaptcha required by Firebase for Phone Auth */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={true}
      />

      <Text style={styles.title}>Welcome to Shirva Care</Text>
      
      {!verificationId ? (
        <>
          <Text style={styles.subtitle}>Enter your phone number to login</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            autoFocus
            autoCompleteType="tel"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <TouchableOpacity style={styles.button} onPress={sendVerification} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Enter the 6-digit OTP sent to {phoneNumber}</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            autoFocus
            keyboardType="number-pad"
            value={verificationCode}
            onChangeText={setVerificationCode}
          />
          <TouchableOpacity style={styles.button} onPress={confirmCode} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify Login</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F5F5F5' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 10, fontSize: 18, marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
