import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const LANGUAGE_OPTIONS = ['Tulu', 'Kannada', 'English', 'Konkani'];
const MOBILITY_OPTIONS = ['Independent', 'Uses Stick', 'Wheelchair', 'Bedridden'];

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
    primaryLanguage: 'Tulu',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    mobilityStatus: 'Independent'
  });

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.address) {
      Alert.alert("Error", "Please fill in your name and address.");
      return;
    }
    // Here we would normally POST this to our backend to create the Senior record
    Alert.alert("Profile Created!", "Welcome to Shirva Care.");
    onProfileComplete(formData);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Help us understand your needs better.</Text>

      <Text style={styles.label}>Full Name *</Text>
      <TextInput style={styles.input} placeholder="e.g. Ramesh Shetty" value={formData.fullName} onChangeText={t => handleChange('fullName', t)} />

      <Text style={styles.label}>Age</Text>
      <TextInput style={styles.input} placeholder="e.g. 72" keyboardType="numeric" value={formData.age} onChangeText={t => handleChange('age', t)} />

      <Text style={styles.label}>Gender</Text>
      <OptionSelector options={GENDER_OPTIONS} selectedValue={formData.gender} onSelect={(val) => handleChange('gender', val)} />

      <Text style={styles.label}>Primary Language</Text>
      <OptionSelector options={LANGUAGE_OPTIONS} selectedValue={formData.primaryLanguage} onSelect={(val) => handleChange('primaryLanguage', val)} />

      <Text style={styles.label}>Complete Physical Address *</Text>
      <TextInput style={[styles.input, {height: 80}]} multiline placeholder="House Name, Street, Landmark, Pincode" value={formData.address} onChangeText={t => handleChange('address', t)} />

      <Text style={styles.label}>Emergency Contact Name</Text>
      <TextInput style={styles.input} placeholder="e.g. Suresh (Son)" value={formData.emergencyContactName} onChangeText={t => handleChange('emergencyContactName', t)} />

      <Text style={styles.label}>Emergency Contact Phone</Text>
      <TextInput style={styles.input} placeholder="+91..." keyboardType="phone-pad" value={formData.emergencyContactPhone} onChangeText={t => handleChange('emergencyContactPhone', t)} />

      <Text style={styles.label}>Mobility Status</Text>
      <OptionSelector options={MOBILITY_OPTIONS} selectedValue={formData.mobilityStatus} onSelect={(val) => handleChange('mobilityStatus', val)} />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.btnText}>Save Profile</Text>
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
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  optionContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  optionBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#e0e0e0', borderWidth: 1, borderColor: '#ccc' },
  optionBtnActive: { backgroundColor: '#4CAF50', borderColor: '#388E3C' },
  optionText: { color: '#333', fontWeight: '500' },
  optionTextActive: { color: '#fff', fontWeight: 'bold' }
});
