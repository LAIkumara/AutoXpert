import { Text, View, StyleSheet, TouchableOpacity, Image, Animated, ScrollView, Platform } from 'react-native';
import React, { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import Loading from '../../styles/loading';
import Layout from '../layout';
import { router } from 'expo-router';

export default function Page1() {
  const [image, setImage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const buttonWidthUpload = useRef(new Animated.Value(80)).current;
  const buttonWidthCapture = useRef(new Animated.Value(80)).current;
  const buttonOpacityUpload = useRef(new Animated.Value(1)).current;
  const buttonOpacityCapture = useRef(new Animated.Value(1)).current;

  const pickImage = async () => {
    collapseButton(buttonWidthUpload, buttonOpacityUpload);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      setImage(uri);
      uploadImage(uri);
    } else {
      resetButtons();
    }
  };

  const captureImage = async () => {
    collapseButton(buttonWidthCapture, buttonOpacityCapture);

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      setImage(uri);
      uploadImage(uri);
    } else {
      resetButtons();
    }
  };

  const uploadImage = async (uri: string) => {
    setIsLoading(true);
    const formData = new FormData();

    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('image', blob, 'image.jpg');
      } else {
        formData.append('image', {
          uri,
          name: 'image.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const response = await axios.post('http://192.168.184.18:5000/tire_segmentation/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log("Backend Response:", response.data);

      const { predicted_tire_depth_mm, tire_condition } = response.data;

      router.push({
        pathname: '/tire_quality_assesment/assessment_page',
        params: {
          predicted_tire_depth_mm,
          tire_condition,
        },
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadMessage('Error uploading image');
    } finally {
      setIsLoading(false);
      resetButtons();
    }
  };

  const collapseButton = (width: Animated.Value, opacity: Animated.Value) => {
    Animated.parallel([
      Animated.timing(width, {
        toValue: 60,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0.7,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const resetButtons = () => {
    Animated.parallel([
      Animated.timing(buttonWidthUpload, {
        toValue: 80,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(buttonOpacityUpload, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(buttonWidthCapture, {
        toValue: 80,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(buttonOpacityCapture, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <Layout>
      <LinearGradient colors={['#ffffff', '#e6f7ff']} style={styles.gradientBackground}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            {isLoading && <Loading />}

            <View style={styles.header}>
              <Text style={styles.subtitle}>Tire Quality Assessment</Text>
              <Text style={styles.description}>
                Upload or capture an image of a tire to assess its quality.
              </Text>
            </View>

            <View style={styles.header}>
              <Text style={styles.description1}>
                Make sure to take pictures only from the side of the tire that shows the pattern
              </Text>
            </View>

            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/images/tire_home.jpeg')}
                style={styles.image}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={pickImage} disabled={isLoading}>
                <Animated.View
                  style={[styles.button, styles.uploadButton, {
                    width: buttonWidthUpload,
                    opacity: buttonOpacityUpload
                  }]}
                >
                  <Ionicons name="image" size={32} color="white" />
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity onPress={captureImage} disabled={isLoading}>
                <Animated.View
                  style={[styles.button, styles.captureButton, {
                    width: buttonWidthCapture,
                    opacity: buttonOpacityCapture
                  }]}
                >
                  <Ionicons name="camera" size={32} color="white" />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {uploadMessage && <Text style={styles.messageText}>{uploadMessage}</Text>}
          </View>
        </ScrollView>
      </LinearGradient>
    </Layout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  description1: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  imageContainer: {
    width: 200,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    height: 80,
    borderRadius: 40,
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
  messageText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});