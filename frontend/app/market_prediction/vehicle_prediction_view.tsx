import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Dimensions, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Layout from '../layout';
import { LineChart } from 'react-native-chart-kit';

const VehiclePredictionView = () => {
  const params = useLocalSearchParams();
  const { vehicle_type, model_year, totalPrice } = params;

  const [loading, setLoading] = useState(false);
  const [priceTrends, setPriceTrends] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (!vehicle_type || !model_year) {
      Alert.alert('Error', 'Missing vehicle type or model year');
      return;
    }

    const fetchPriceTrends = async () => {
      setLoading(true);
      try {
        const url = `http://192.168.184.18:5000/vehicle_price_trends?vehicle_type=${vehicle_type}&model_year=${model_year}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.status === 'success' && json.data) {
          setPriceTrends(json.data);
        } else {
          Alert.alert('Error', json.message || 'Failed to fetch price trends');
        }
      } catch (e) {
        Alert.alert('Error', 'Network error fetching price trends');
      }
      setLoading(false);
    };

    fetchPriceTrends();
  }, [vehicle_type, model_year]);

  const screenWidth = Dimensions.get('window').width;

  // Prepare data for line chart
  const labels = priceTrends ? Object.keys(priceTrends) : [];
  const dataPoints = priceTrends ? Object.values(priceTrends) : [];

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.header}>Current Vehicle Price</Text>
          <Text style={styles.price}>
            Rs. {totalPrice ? Number(totalPrice).toLocaleString() : 'N/A'}
          </Text>

          {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}

          {priceTrends && labels.length > 0 && (
            <LineChart
              data={{
                labels: labels,
                datasets: [{ data: dataPoints }],
              }}
              width={screenWidth - 40}
              height={260}
              yAxisLabel="Rs "
              yAxisSuffix=""
              chartConfig={{
                backgroundGradientFrom: '#f5f9ff',
                backgroundGradientTo: '#e1efff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '3',
                  stroke: '#007AFF',
                  fill: '#fff',
                },
              }}
              bezier
              style={styles.chart}
            />
          )}

          <Text style={styles.subHeader}>Vehicle Market Analysis Past 5 Years</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f3ff',
    paddingVertical: 20,
  },
  container: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  price: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1E7E34',
    marginBottom: 24,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  chart: {
    marginVertical: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default VehiclePredictionView;
