import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // State management for inputs and results
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');
  const [lastBmi, setLastBmi] = useState(null);

  // Load last BMI from AsyncStorage on app start
  useEffect(() => {
    loadLastBMI();
  }, []);

  // Function to load last calculated BMI from AsyncStorage
  const loadLastBMI = async () => {
    try {
      const savedBMI = await AsyncStorage.getItem('lastBMI');
      const savedCategory = await AsyncStorage.getItem('lastCategory');
      if (savedBMI !== null && savedCategory !== null) {
        setLastBmi({
          bmi: parseFloat(savedBMI),
          category: savedCategory
        });
      }
    } catch (error) {
      console.log('Error loading last BMI:', error);
    }
  };

  // Function to save BMI to AsyncStorage
  const saveBMI = async (bmiValue, categoryValue) => {
    try {
      await AsyncStorage.setItem('lastBMI', bmiValue.toString());
      await AsyncStorage.setItem('lastCategory', categoryValue);
    } catch (error) {
      console.log('Error saving BMI:', error);
    }
  };

  // Input validation function
  const validateInputs = () => {
    // Check if fields are empty
    if (!weight.trim() || !height.trim()) {
      Alert.alert('Error', 'Please fill in both weight and height fields');
      return false;
    }

    // Check if inputs are valid positive numbers
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || isNaN(heightNum)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return false;
    }

    if (weightNum <= 0 || heightNum <= 0) {
      Alert.alert('Error', 'Please enter positive numbers for weight and height');
      return false;
    }

    if (heightNum > 300 || weightNum > 1000) {
      Alert.alert('Error', 'Please enter realistic values for height and weight');
      return false;
    }

    return true;
  };

  // BMI calculation function
  const calculateBMI = () => {
    // Validate inputs first
    if (!validateInputs()) {
      return;
    }

    // Convert inputs to numbers
    const weightInKg = parseFloat(weight);
    const heightInCm = parseFloat(height);

    // Convert height from cm to meters
    const heightInMeters = heightInCm / 100;

    // Calculate BMI using the formula: BMI = weight(kg) / height(m)²
    const calculatedBMI = weightInKg / (heightInMeters * heightInMeters);

    // Round to 2 decimal places
    const roundedBMI = Math.round(calculatedBMI * 100) / 100;

    // Determine BMI category
    let bmiCategory = '';
    if (roundedBMI < 18.5) {
      bmiCategory = 'Underweight';
    } else if (roundedBMI >= 18.5 && roundedBMI <= 24.9) {
      bmiCategory = 'Normal weight';
    } else if (roundedBMI >= 25 && roundedBMI <= 29.9) {
      bmiCategory = 'Overweight';
    } else {
      bmiCategory = 'Obese';
    }

    // Update state
    setBmi(roundedBMI);
    setCategory(bmiCategory);

    // Save to AsyncStorage
    saveBMI(roundedBMI, bmiCategory);
  };

  // Clear all fields and results
  const clearAll = () => {
    setWeight('');
    setHeight('');
    setBmi(null);
    setCategory('');
  };

  // Function to get category color
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Underweight':
        return '#3498db'; // Blue
      case 'Normal weight':
        return '#2ecc71'; // Green
      case 'Overweight':
        return '#f39c12'; // Orange
      case 'Obese':
        return '#e74c3c'; // Red
      default:
        return '#34495e'; // Dark gray
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BMI Calculator</Text>
          <Text style={styles.headerSubtitle}>Calculate your Body Mass Index</Text>
        </View>

        {/* Last BMI Display */}
        {lastBmi && (
          <View style={styles.lastBmiContainer}>
            <Text style={styles.lastBmiTitle}>Last Calculated BMI:</Text>
            <Text style={styles.lastBmiValue}>
              {lastBmi.bmi} - {lastBmi.category}
            </Text>
          </View>
        )}

        {/* Input Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your weight in kilograms"
            placeholderTextColor="#95a5a6"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            maxLength={6}
          />

          <Text style={styles.inputLabel}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your height in centimeters"
            placeholderTextColor="#95a5a6"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.calculateButton} onPress={calculateBMI}>
            <Text style={styles.calculateButtonText}>Calculate BMI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {bmi !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Your BMI Result</Text>
            
            <View style={styles.bmiValueContainer}>
              <Text style={styles.bmiValue}>{bmi}</Text>
            </View>

            <View style={[styles.categoryContainer, { backgroundColor: getCategoryColor(category) }]}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>

            {/* BMI Scale Reference */}
            <View style={styles.scaleContainer}>
              <Text style={styles.scaleTitle}>BMI Scale Reference:</Text>
              <View style={styles.scaleItem}>
                <Text style={styles.scaleText}>• Below 18.5: Underweight</Text>
              </View>
              <View style={styles.scaleItem}>
                <Text style={styles.scaleText}>• 18.5 - 24.9: Normal weight</Text>
              </View>
              <View style={styles.scaleItem}>
                <Text style={styles.scaleText}>• 25.0 - 29.9: Overweight</Text>
              </View>
              <View style={styles.scaleItem}>
                <Text style={styles.scaleText}>• 30.0 and above: Obese</Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: '#2c3e50',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#bdc3c7',
  },
  lastBmiContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  lastBmiTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  lastBmiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#2c3e50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  calculateButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  bmiValueContainer: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginBottom: 15,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  categoryContainer: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scaleContainer: {
    width: '100%',
    marginTop: 10,
  },
  scaleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  scaleItem: {
    marginVertical: 2,
  },
  scaleText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 18,
  },
});