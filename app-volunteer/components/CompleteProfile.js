import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const VEHICLE_OPTIONS = ['None', '2-Wheeler', '4-Wheeler'];

const OptionSelector = ({ options, selectedValue, onSelect }) => (
  <View style={styles.optionContainer}>
    {options.map((opt) => (
      <TouchableOpacity 
        key={opt} 
        style={[styles.optionBtn, selectedValue === opt && styles.optionBtnActive]}
        onPress={() => onSelect(opt)}
      >
        <Text style={[styles.optionText, selectedValue === opt && styles.optionTextActive]}>{opt}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function CompleteProfile({ user, onProfileComplete }) {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    languages: '',
    residentialArea: '',
    vehicleOwnership: 'None',
    profession: '',
    aadharNumber: ''
  });

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.aadharNumber) {
      Alert.alert("Error", "Please fill in your name and Aadhar number for police verification.");
      return;
    }
    // Normally POST to backend. The backend sets is_verified = false automatically.
    Alert.alert(
      "Profile Submitted", 
      "Your profile has been sent to Shirva Police for verification. You will be able to accept tasks once approved."
    );
    onProfileComplete(formData);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Volunteer Registration</Text>
      <Text style={styles.subtitle}>Help your Shirva community safely.</Text>

      <Text style={styles.label}>Full Name *</Text>
      <TextInput style={styles.input} placeholder="e.g. Ramesh Shetty" value={formData.fullName} onChangeText={t => handleChange('fullName', t)} />

      <Text style={styles.label}>Age</Text>
      <TextInput style={styles.input} placeholder="e.g. 24" keyboardType="numeric" value={formData.age} onChangeText={t => handleChange('age', t)} />

      <Text style={styles.label}>Gender</Text>
      <OptionSelector options={GENDER_OPTIONS} selectedValue={formData.gender} onSelect={(val) => handleChange('gender', val)} />

      <Text style={styles.label}>Languages Spoken</Text>
      <TextInput style={styles.input} placeholder="e.g. Tulu, Kannada, English" value={formData.languages} onChangeText={t => handleChange('languages', t)} />

      <Text style={styles.label}>Residential Area / Ward</Text>
      <TextInput style={styles.input} placeholder="e.g. Ward 3, Near Temple" value={formData.residentialArea} onChangeText={t => handleChange('residentialArea', t)} />

      <Text style={styles.label}>Vehicle Ownership</Text>
      <OptionSelector options={VEHICLE_OPTIONS} selectedValue={formData.vehicleOwnership} onSelect={(val) => handleChange('vehicleOwnership', val)} />

      <Text style={styles.label}>Profession / Special Skills</Text>
      <TextInput style={styles.input} placeholder="e.g. Nurse (Medical), Electrician" value={formData.profession} onChangeText={t => handleChange('profession', t)} />

      <Text style={styles.label}>Aadhar Number (For Police Verification) *</Text>
      <TextInput style={styles.input} placeholder="XXXX-XXXX-XXXX" keyboardType="numeric" value={formData.aadharNumber} onChangeText={t => handleChange('aadharNumber', t)} />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.btnText}>Submit to Admin (Police)</Text>
      </TouchableOpacity>
      
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginTop: 30 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 5 },
  button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  optionContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  optionBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#e0e0e0', borderWidth: 1, borderColor: '#ccc' },
  optionBtnActive: { backgroundColor: '#2196F3', borderColor: '#1976D2' },
  optionText: { color: '#333', fontWeight: '500' },
  optionTextActive: { color: '#fff', fontWeight: 'bold' }
});
