// Importing necessary dependencies and components
import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,ScrollView,Alert,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For local storage
import Toast from 'react-native-toast-message'; // For displaying BMI result popup

export default function App() {
  // State hooks to track weight, height, BMI value, and BMI status
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState('');

  // Load last saved BMI on initial render
  useEffect(() => {
    loadLastBMI();
  }, []);

  // Function to calculate BMI
  const calculateBMI = () => {
    // Input validation
    if (!weight || !height || isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
      Alert.alert('Invalid input', 'Please enter positive numeric values.');
      return;
    }

    // Convert height from cm to meters
    const hInMeters = parseFloat(height) / 100;

    // BMI formula: weight (kg) / height (m)^2
    const bmiValue = parseFloat(weight) / (hInMeters * hInMeters);

    // Round BMI to two decimal places
    const roundedBmi = bmiValue.toFixed(2);

    // Get BMI category
    const bmiStatus = getStatus(bmiValue);

    // Save results in state
    setBmi(roundedBmi);
    setStatus(bmiStatus);

    // Save result in local storage
    saveLastBMI(roundedBmi, bmiStatus);

    // Show toast with BMI and status
    Toast.show({
      type: 'success',
      text1: `BMI: ${roundedBmi}`,
      text2: `Category: ${bmiStatus}`,
      position: 'top',
    });
  };

  // Determine BMI status category
  const getStatus = (bmiValue) => {
    if (bmiValue < 18.5) return 'Underweight';
    else if (bmiValue < 25) return 'Normal weight';
    else if (bmiValue < 30) return 'Overweight';
    else return 'Obese';
  };

  // Clear all inputs and results
  const clearAll = () => {
    setWeight('');
    setHeight('');
    setBmi(null);
    setStatus('');
  };

  // Save last calculated BMI to AsyncStorage
  const saveLastBMI = async (value, status) => {
    try {
      await AsyncStorage.setItem('lastBMI', JSON.stringify({ value, status }));
    } catch (e) {
      console.error('Failed to save BMI:', e);
    }
  };

  // Load previously saved BMI from AsyncStorage
  const loadLastBMI = async () => {
    try {
      const saved = await AsyncStorage.getItem('lastBMI');
      if (saved) {
        const { value, status } = JSON.parse(saved);
        setBmi(value);
        setStatus(status);
      }
    } catch (e) {
      console.error('Failed to load BMI:', e);
    }
  };

  // UI rendering
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>BMI Calculator</Text>

      {/* Weight Input */}
      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        placeholder="Enter your weight"
      />

      {/* Height Input */}
      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
        placeholder="Enter your height"
      />

      {/* Buttons: Calculate and Clear */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.calculateButton} onPress={calculateBMI}>
          <Text style={styles.buttonText}>Calculate BMI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* BMI Result and Status (only if BMI is calculated) */}
      {bmi && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Your BMI: {bmi}</Text>
          <Text style={styles.statusText}>Category: {status}</Text>
        </View>
      )}

      {/* Toast component for pop-up messages */}
      <Toast />
    </ScrollView>
  );
}

// Stylesheet for UI design
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a8',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 16,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: '#0a8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#aaa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#e0f7e9',
    borderRadius: 10,
  },
  resultText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a8',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
    marginTop: 8,
  },
});
