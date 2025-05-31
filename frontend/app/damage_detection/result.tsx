import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Layout from '../layout';
import { useRouter } from 'expo-router';

export default function DamageResult() {
  const { 
    vehicle, 
    bodyType, 
    damageType, 
    repairability,
    newPriceRange,
    repairCostRange,
    repairCostLow,
    repairCostHigh
  } = useLocalSearchParams();  

  const router = useRouter();

  // Function to navigate to the 'Find Repair Shops' page
  const handleFindRepairShops = () => {
    router.push('/damage_detection/find_repair_shops');  // You can replace '/find_repair_shops' with your actual route
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Damage Assessment Result</Text>

        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Vehicle:</Text>
              <Text style={styles.value}>{vehicle}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Body Part:</Text>
              <Text style={styles.value}>{bodyType}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Damage Type:</Text>
              <Text style={styles.value}>{damageType}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Brand New Part Price:</Text>
              <Text style={styles.priceValue}>{newPriceRange}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Repair Cost:</Text>
              <Text style={styles.priceValue}>{repairCostRange}</Text>
            </View>
          </View>
        </View>

        {/* "Find Repair Shops" Button */}
        <Button 
          title="Find Repair Shops"
          onPress={handleFindRepairShops}
          color="#007bff" // You can customize the color here
        />
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  repairable: {
    color: '#2e7d32',
  },
  unrepairable: {
    color: '#c62828',
  },
  debugContainer: {
    backgroundColor: '#eef',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
