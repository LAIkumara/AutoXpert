import { Text, View, StyleSheet, TouchableOpacity, Image, Animated, ScrollView, Alert } from 'react-native';
import React, { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import Layout from '../layout';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import Loading from '../../styles/loading';
import { Picker as RNPicker } from '@react-native-picker/picker';

export default function Page1() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');

  // Animation refs
  const buttonWidthUpload = useRef(new Animated.Value(80)).current;
  const buttonWidthCapture = useRef(new Animated.Value(80)).current;
  const buttonOpacityUpload = useRef(new Animated.Value(1)).current;
  const buttonOpacityCapture = useRef(new Animated.Value(1)).current;
  const submitButtonScale = useRef(new Animated.Value(1)).current;

  const vehicleOptions = ['', 'Toyota Highlander', 'Toyota Prius', 'Toyota Tacoma', 'Toyota Tundra'];
  const bodyTypeOptions = ['', 'Rear Left Door', 'Front Left Door', 'Hood', 'Rear Bumper', 'Front Bumper'];

  const pickImage = async () => {
    animateButton(buttonWidthUpload, buttonOpacityUpload);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    handleImageResult(result);
  };

  const captureImage = async () => {
    animateButton(buttonWidthCapture, buttonOpacityCapture);
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    handleImageResult(result);
  };

  const handleImageResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
    resetButtons();
  };

  const validateForm = () => {
    if (!selectedVehicle) {
      Alert.alert('Validation Error', 'Please select a vehicle');
      return false;
    }
    if (!selectedBodyType) {
      Alert.alert('Validation Error', 'Please select a body type');
      return false;
    }
    if (!image) {
      Alert.alert('Validation Error', 'Please upload or capture an image');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    Animated.sequence([
      Animated.timing(submitButtonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(submitButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setIsLoading(true);
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('image', { 
        uri: image!, 
        name: 'damage.jpg', 
        type: 'image/jpeg' 
      });
      formData.append('vehicle', selectedVehicle);
      formData.append('body_type', selectedBodyType);

      const response = await axios.post(
        'http://192.168.184.18:5000/damage_detection/upload', 
        formData, 
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        }
      );

      if (response.data.status === "error") {
        if (response.data.fallback_data) {
          handleFallbackResponse(response.data);
          return;
        }
        throw new Error(response.data.error || "Processing failed");
      }

      router.push({
        pathname: '/damage_detection/result',
        params: {
          vehicle: response.data.vehicle,
          bodyType: response.data.body_type,
          damageType: response.data.damage_type,
          repairability: response.data.repairability,
          newPriceRange: response.data.new_price_range,
          repairCostRange: response.data.repair_cost_range,
          repairCostLow: response.data.repair_cost_low,
          repairCostHigh: response.data.repair_cost_high
        }
      });      
      
      console.log('API response:', response.data);


    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Upload failed. Please try again with a clearer image."
      );
    } finally {
      setIsLoading(false);
    }
};

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    formData.append('image', { 
      uri, 
      name: 'damage.jpg', 
      type: 'image/jpeg' 
    });
    formData.append('vehicle', selectedVehicle);
    formData.append('body_type', selectedBodyType);

    try {
      const response = await axios.post(
        'http://192.168.184.18:5000/damage_detection/upload', 
        formData, 
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        }
      );

      console.log('API Response:', response.data);

      if (response.data.status === "error") {
        if (response.data.fallback_data) {
          handleFallbackResponse(response.data);
          return;
        }
        throw new Error(response.data.error || "Processing failed");
      }

      if (!response.data.new_price_range || !response.data.repair_cost_range) {
        throw new Error("Incomplete data received from server");
      }

      router.push({
        pathname: '/damage_detection/result',
        params: {
          ...response.data,
          isEstimate: "false",
          // Add formatted display strings
          priceDisplay: `${response.data.new_price_range} (Repair: ${response.data.repair_cost_range})`,
          confidence: response.data.detection_details?.confidence_scores?.[0]?.toFixed(2) || '0.75'
        }
      });

    } catch (error: any) {
      console.error('Upload Error:', error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.error || 
        error.message || 
        "Upload failed. Please try again with a clearer image."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallbackResponse = (data: any) => {
    Alert.alert(
      "Limited Assessment",
      data.error,
      [
        { 
          text: "Use Estimate", 
          onPress: () => router.push({
            pathname: '/damage_detection/result',
            params: {
              ...data.fallback_data,
              isEstimate: "true",
              damageType: "Unknown",
              repairability: "Unknown"
            }
          }) 
        },
        { text: "Retry", style: "cancel" }
      ]
    );
  };

  // Animation helpers
  const animateButton = (width: Animated.Value, opacity: Animated.Value) => {
    Animated.parallel([
      Animated.timing(width, { toValue: 60, duration: 300, useNativeDriver: false }),
      Animated.timing(opacity, { toValue: 0.7, duration: 300, useNativeDriver: false }),
    ]).start();
  };

  const resetButtons = () => {
    Animated.parallel([
      Animated.timing(buttonWidthUpload, { toValue: 80, duration: 300, useNativeDriver: false }),
      Animated.timing(buttonOpacityUpload, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.timing(buttonWidthCapture, { toValue: 80, duration: 300, useNativeDriver: false }),
      Animated.timing(buttonOpacityCapture, { toValue: 1, duration: 300, useNativeDriver: false }),
    ]).start();
  };

  return (
    <Layout>
      <LinearGradient colors={['#ffffff', '#e6f7ff']} style={styles.gradientBackground}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Loading />
          </View>
        )}
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.subtitle}>Damage Detection</Text>
              <Text style={styles.description}>
                Enter your damage details and we will provide damage estimates!
              </Text>
            </View>

            


            <View style={styles.imageContainer}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <LottieView
                  source={require('../../assets/damage-detection.json')}
                  autoPlay
                  loop
                  style={styles.animatedImage}
                />
              )}
            </View>
              
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={pickImage} disabled={isLoading}>
                <Animated.View style={[
                  styles.button,
                  styles.uploadButton,
                  {
                    width: buttonWidthUpload,
                    opacity: buttonOpacityUpload,
                    borderRadius: Animated.divide(buttonWidthUpload, 2),
                  },
                ]}>
                  <Ionicons name="image" size={32} color="white" />
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity onPress={captureImage} disabled={isLoading}>
                <Animated.View style={[
                  styles.button,
                  styles.captureButton,
                  {
                    width: buttonWidthCapture,
                    opacity: buttonOpacityCapture,
                    borderRadius: Animated.divide(buttonWidthCapture, 2),
                  },
                ]}>
                  <Ionicons name="camera" size={32} color="white" />
                </Animated.View>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}> 
              <Text style={styles.pickerLabelA}>Upload Your Damage Image *</Text>
            </View>

            <View style={styles.selectionContainer}>
              {/* Vehicle Picker */}
              <View style={styles.pickerContainer}>
                {Platform.OS === 'web' ? (
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    style={styles.webPicker}
                    required
                  >
                    {vehicleOptions.map((vehicle) => (
                      <option key={vehicle} value={vehicle}>
                        {vehicle || 'Select Vehicle'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <RNPicker
                    selectedValue={selectedVehicle}
                    onValueChange={(itemValue) => setSelectedVehicle(itemValue)}
                    style={styles.mobilePicker}
                  >
                    {vehicleOptions.map((vehicle) => (
                      <RNPicker.Item 
                        key={vehicle} 
                        label={vehicle || 'Select Your Vehicle *'} 
                        value={vehicle} 
                      />
                    ))}
                  </RNPicker>
                )}
              </View>

              {/* Body Type Picker */}
              <View style={styles.pickerContainer}>
                {Platform.OS === 'web' ? (
                  <select
                    value={selectedBodyType}
                    onChange={(e) => setSelectedBodyType(e.target.value)}
                    style={styles.webPicker}
                    required
                  >
                    {bodyTypeOptions.map((bodyType) => (
                      <option key={bodyType} value={bodyType}>
                        {bodyType || 'Select Body Type'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <RNPicker
                    selectedValue={selectedBodyType}
                    onValueChange={(itemValue) => setSelectedBodyType(itemValue)}
                    style={styles.mobilePicker}
                  >
                    {bodyTypeOptions.map((bodyType) => (
                      <RNPicker.Item 
                        key={bodyType} 
                        label={bodyType || 'Select Damaged Body Type *'} 
                        value={bodyType} 
                      />
                    ))}
                  </RNPicker>
                )}
              </View>
            </View>
            

            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={isLoading}
              style={styles.submitButtonContainer}
            >
              <Animated.View style={[
                styles.submitButton,
                { transform: [{ scale: submitButtonScale }] }
              ]}>
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Processing...' : 'SUBMIT'}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </Layout>
  );
}

const styles = StyleSheet.create({

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    opacity: 0.9 ,
    zIndex: 1000, // Ensure it appears above everything
  },
  submitButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  gradientBackground: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  selectionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 15,
    width: '100%',
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  pickerLabelA: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  },
  webPicker: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  mobilePicker: {
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  animatedImage: {
    width: 250,
    height: 250,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
  },
  uploadButton: {
    backgroundColor: '#007bff',
  },
  captureButton: {
    backgroundColor: '#28a745',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  messageText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});