import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Layout from '../layout';

const HomeScreen = () => {
  const [year, setYear] = useState('2010'); // Default year
  const [color, setColor] = useState('Red'); // Default color
  const [mileage, setMileage] = useState('0-50000'); // Default mileage
  const [owners, setOwners] = useState('1'); // Default owners
  const [fuelType, setFuelType] = useState('Hybrid');

  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract both vehicle_type and image_path from route params
  const { vehicle_type, image_path } = params;

  const handleSubmit = async () => {
    const payload = {
      vehicle_type,      // from params
      image_path,        // from params
      year: parseInt(year, 10),
      color,
      mileage,
      owners: parseInt(owners, 10),
      fuelType,
    };
  
    try {
      const response = await fetch('http://192.168.184.18:5000/vehicle_classification/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const json = await response.json();
  
      if (json.status === 'success') {
        router.push({
          pathname: '/market_prediction/vehicle_prediction_view',
          params: {
            vehicle_type,
            model_year: year,
            totalPrice: json.predicted_price.toString(),
          },
        });
      } else {
        Alert.alert('Prediction failed', json.message || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get prediction from server');
    }
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.vehicleTypeText}>
            {(() => {
              let message = '';
              switch (vehicle_type) {
                case 'Toyota_Tundra':
                  message = 'Your vehicle type is Highlander';
                  break;
                case 'Toyota_Highlander':
                  message = 'Your vehicle type is Tundra';
                  break;
                case 'Toyota_Tacoma':
                  message = 'Your vehicle type is Prius';
                  break;
                case 'Toyota_Prius':
                  message = 'Your vehicle type is Tacoma';
                  break;
                default:
                  message = 'Unknown vehicle type';
              }
              return <Text>{message}</Text>;
            })()}
          </Text>

          <Text style={styles.label}>Select Year:</Text>
          <Picker selectedValue={year} style={styles.picker} onValueChange={setYear}>
            {[...Array(10).keys()].map(i => {
              const yearOption = 2010 + i;
              return <Picker.Item key={yearOption} label={`${yearOption}`} value={`${yearOption}`} />;
            })}
          </Picker>

          <Text style={styles.label}>Select Color:</Text>
          <Picker selectedValue={color} style={styles.picker} onValueChange={setColor}>
            <Picker.Item label="Red" value="Red" />
            <Picker.Item label="Blue" value="Blue" />
            <Picker.Item label="Black" value="Black" />
            <Picker.Item label="White" value="White" />
            <Picker.Item label="Silver" value="Silver" />
            <Picker.Item label="Grey" value="Grey" />
          </Picker>

          <Text style={styles.label}>Select Mileage Range:</Text>
          <Picker selectedValue={mileage} style={styles.picker} onValueChange={setMileage}>
            <Picker.Item label="0 - 50,000 km" value="0-50000" />
            <Picker.Item label="50,000 - 100,000 km" value="50000-100000" />
            <Picker.Item label="100,000 - 200,000 km" value="100000-200000" />
            <Picker.Item label="200,000 - 500,000 km" value="200000-500000" />
            <Picker.Item label="500,000+ km" value="500000+" />
          </Picker>

          <Text style={styles.label}>Select Number of Owners:</Text>
          <Picker selectedValue={owners} style={styles.picker} onValueChange={setOwners}>
            <Picker.Item label="1 Owner" value="1" />
            <Picker.Item label="2 Owners" value="2" />
            <Picker.Item label="3 Owners" value="3" />
            <Picker.Item label="4 Owners" value="4" />
            <Picker.Item label="5 or More Owners" value="5" />
          </Picker>

          <Text style={styles.label}>Select Fuel Type:</Text>
          <Picker selectedValue={fuelType} style={styles.picker} onValueChange={setFuelType}>
            <Picker.Item label="Petrol" value="Petrol" />
            <Picker.Item label="Diesel" value="Diesel" />
            <Picker.Item label="Hybrid" value="Hybrid" />
          </Picker>

          <Button title="Submit" onPress={handleSubmit} />
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vehicleTypeText: {
    fontSize: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginTop: 10,
  },
  picker: {
    width: 250,
    height: 50,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
  },
});

export default HomeScreen;
