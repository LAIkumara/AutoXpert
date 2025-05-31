import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import Layout from '../layout';

type Coordinate = {
  latitude: number;
  longitude: number;
};

const StoreRegistrationScreen = () => {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(1);

  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState<Coordinate | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to register your store.');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to get location.');
      }
    })();
  }, []);

  const handleNext = () => {
    if (step === 1) {
      if (!storeName || !storeType || !contactNumber || !email || !password || !confirmPassword) {
        Alert.alert('Missing Fields', 'Please fill all required fields.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match.');
        return;
      }
    }

    if (step === 3 && !location) {
      Alert.alert('Missing Location', 'Please select a store location.');
      return;
    }

    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert('Missing Location', 'Location is required.');
      return;
    }

    const formData = {
      store_name: storeName,
      store_type: storeType,
      store_description: storeDescription,
      contact_number: contactNumber,
      email,
      password,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    try {
      const response = await fetch('http://192.168.184.18:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message, [
          { text: 'OK', onPress: () => navigation.navigate('LoginScreen') },
        ]);
      } else {
        Alert.alert('Registration Failed', data.message || 'Unable to register.');
      }
    } catch (error) {
      Alert.alert('Server Error', 'Check your connection and try again.');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {[1, 2, 3].map((s) => (
        <TouchableOpacity
          key={s}
          onPress={() => setStep(s)}
          style={[styles.stepCircle, step === s && styles.activeStep]}>
          <Text style={[styles.stepText, step === s && styles.activeStepText]}>{s}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleMapPress = (e: MapPressEvent) => {
    setLocation(e.nativeEvent.coordinate);
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Store Registration</Text>
        {renderStepIndicator()}

        {step === 1 && (
          <>
            <Text style={styles.label}>Store Name</Text>
            <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} />

            <Text style={styles.label}>Store Type</Text>
            <TextInput style={styles.input} value={storeType} onChangeText={setStoreType} />

            <Text style={styles.label}>Contact Number</Text>
            <TextInput style={styles.input} value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

            <Text style={styles.label}>Confirm Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              {confirmPassword && password === confirmPassword && (
                <Text style={{ marginLeft: 10, color: 'green', fontWeight: 'bold' }}>✅</Text>
              )}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.label}>Store Description</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              value={storeDescription}
              onChangeText={setStoreDescription}
              multiline
            />
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.label}>Store Location</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location?.latitude || 7.8731,
                longitude: location?.longitude || 80.7718,
                latitudeDelta: 2.5,
                longitudeDelta: 2.5,
              }}
              onPress={handleMapPress}
            >
              {location && <Marker coordinate={location} />}
            </MapView>
          </>
        )}

        <View style={styles.buttonGroup}>
          {step > 1 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
              <Text style={styles.secondaryText}>Back</Text>
            </TouchableOpacity>
          )}

          {step < 3 ? (
            <TouchableOpacity style={styles.submitButton} onPress={handleNext}>
              <Text style={styles.submitButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Register</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },

  stepContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  activeStep: { backgroundColor: '#007bff' },
  stepText: { color: '#000', fontWeight: 'bold' },
  activeStepText: { color: '#fff' },

  label: { fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 10,
    borderColor: '#aaa',
  },

  map: { width: '100%', height: 300, borderRadius: 10 },

  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginLeft: 10,
  },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },

  secondaryButton: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  secondaryText: { color: '#333', fontWeight: 'bold' },
});

export default StoreRegistrationScreen;