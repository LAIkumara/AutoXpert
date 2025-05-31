// File: find_repair_shops.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, Button, StyleSheet,
  FlatList, Modal, TouchableOpacity,
  ScrollView, Linking, ActivityIndicator,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Layout from '../layout';
import LottieView from 'lottie-react-native';


type ShopDetails = {
  rank: number;
  shopName: string;
  address: string;
  phone: string;
  mapslink: string;
};

type Location = {
  id: string;
  name: string;
};

export default function find_repair_shops() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [shops, setShops] = useState<ShopDetails[]>([]);
  const [selectedShop, setSelectedShop] = useState<ShopDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingShops, setLoadingShops] = useState(false);

  // 1. Load all locations on mount
  useEffect(() => {
    fetch('http://192.168.184.18:5000/shop_locations')
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingLocations(false));
  }, []);

  // 2. Whenever a location is selected, fetch its shops
  useEffect(() => {
    if (!selectedLocation) {
      setShops([]);
      return;
    }
    setLoadingShops(true);
    fetch(`http://192.168.184.18:5000/repair_shops?location_id=${selectedLocation}`)
      .then(res => res.json())
      .then(data => setShops(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingShops(false));
  }, [selectedLocation]);

  const handleShopClick = (shop: ShopDetails) => {
    setSelectedShop(shop);
    setModalVisible(true);
  };

  const renderShopItem = ({ item }: { item: ShopDetails }) => (
    <TouchableOpacity
      style={styles.tableRow}
      onPress={() => handleShopClick(item)}
    >
      <Text style={styles.tableCell}>{item.rank}</Text>
      <Text style={[styles.tableCell, styles.shopNameCell]}>{item.shopName}</Text>
    </TouchableOpacity>
  );

  if (loadingLocations) {
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      </Layout>
    );
  }

  function openMapsLink(mapslink: string) {
    if (mapslink) {
      Linking.canOpenURL(mapslink)
        .then((supported) => {
          if (supported) {
            Linking.openURL(mapslink);
          } else {
            Alert.alert('Error', 'Unable to open this link.');
          }
        })
        .catch(() => Alert.alert('Error', 'An unexpected error occurred.'));
    } else {
      Alert.alert('Error', 'No map link available.');
    }
  }

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.message}>We can help you find the best shops.</Text>

          {/* Location Picker */}
          <Text style={styles.label}>Please select Your Location</Text>

          <LottieView
            source={require('../../assets/shop-location.json')}
            autoPlay
            loop
            style={styles.topAnimation}
          />

          <Text style={styles.message}>We can help you find the best shops.</Text>


          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedLocation}
              onValueChange={value => setSelectedLocation(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a location" value={null} />
              {locations.map(loc => (
                <Picker.Item key={loc.id} label={loc.name} value={loc.id} />
              ))}
            </Picker>
          </View>

          {/* Shops List */}
          {loadingShops ? (
            <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
          ) : (
            selectedLocation && (
              <View style={styles.rankingsContainer}>
                <Text style={styles.subtitle}>
                  Top {shops.length} Shops in {
                    locations.find(l => l.id === selectedLocation)?.name
                  }
                </Text>
                <FlatList
                  data={shops}
                  renderItem={renderShopItem}
                  keyExtractor={item => item.rank.toString()}
                  scrollEnabled={false}
                  style={styles.table}
                />
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* Modal for Shop Details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedShop?.shopName}</Text>
            <Text style={styles.modalText}>Address: {selectedShop?.address}</Text>
            <Text style={styles.modalText}>Phone: {selectedShop?.phone}</Text>
            
            <LottieView
              source={require('../../assets/location.json')} // Add your Lottie animation file
              autoPlay
              loop
              style={styles.animatedImage}
            />


            <View style={styles.buttonContainer}>
              <Button
              title="View on Map"
              onPress={() => selectedShop && openMapsLink(selectedShop.mapslink)} // Open Google Maps link
              color="#007bff"
            />
            <Button
            title="Close"
            onPress={() => setModalVisible(false)}
            color="#FF0000"
          /></View>
            
          </View>
        </View>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({

  topAnimation: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },

  animatedImage: {
    marginTop: -20,
    width: 250,
    height: 250,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { flexGrow: 1 },
  container: { padding: 20 },
  message: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  pickerContainer: {
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  picker: { width: '100%', height: 60 },
  rankingsContainer: { marginTop: 20 },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  table: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: { fontSize: 16, textAlign: 'center' },
  shopNameCell: { flex: 1 },
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%', backgroundColor: '#fff',
    borderRadius: 10, padding: 20, alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalText: { fontSize: 16, marginBottom: 10 },
  buttonContainer: {
    flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20
  },
});
