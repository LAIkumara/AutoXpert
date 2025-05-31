import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Layout from '../layout';

const LoginScreen = () => {
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('1234');
  const router = useRouter();

  // Function to log events locally
  const logEvent = (level: string, message: string) => {
    console.log(`[${level}] ${message} | Email: ${email} | Password: ${password}`);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      logEvent('ERROR', 'Login attempt with missing fields');
      return;
    }
  
    try {
      const response = await fetch('http://your-backend-url/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        logEvent('INFO', 'Login successful');
        router.replace('/feedback/StoreProfile');
      } else {
        logEvent('ERROR', `Login failed: ${data.message}`);
        Alert.alert('Login Failed', data.message || 'Unknown error');
      }
    } catch (error) {
      logEvent('ERROR', `Network error: ${error.message}`);
      Alert.alert('Error', 'Failed to connect to server');
    }
  };
  

  return (
    <Layout>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Store Owner Login</Text>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Enter your Email"
            placeholderTextColor={'#999'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Enter your Password"
            placeholderTextColor={'#999'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Login Button */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* Link to Register Page */}
          <TouchableOpacity onPress={() => router.push('/feedback/StoreRegistraion')}>
            <Text style={styles.linkText}>New Store Owner? Register Here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  card: {
    width: '90%',
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  linkText: {
    color: '#0066CC',
    marginTop: 15,
    fontSize: 14,
  },
});

export default LoginScreen;