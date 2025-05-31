import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Layout from '../layout'; // You can replace this with a View if Layout is not used.

const StoreProfileScreen = () => {
  const [storeName, setStoreName] = useState('My Store');
  const [storeType, setStoreType] = useState('Electronics');
  const [storeDescription, setStoreDescription] = useState('Best electronics in town');
  const [products, setProducts] = useState([
    { id: 1, name: 'Brake System ', price: 5000, stock: true, quantity: 5 },
    { id: 2, name: 'Fog Lamp', price: 2500, stock: false, quantity: 0 },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });

  const toggleStockStatus = (productId) => {
    setProducts(products.map(product =>
      product.id === productId ? { ...product, stock: !product.stock } : product
    ));
  };

  const deleteProduct = (productId) => {
    setProducts(products.filter(product => product.id !== productId));
  };

  const addProduct = () => {
    if (newProduct.name && newProduct.price && newProduct.quantity) {
      setProducts([...products, {
        id: products.length + 1,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: true,
        quantity: parseInt(newProduct.quantity)
      }]);
      setNewProduct({ name: '', price: '', quantity: '' });
      setModalVisible(false);
    }
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Store Profile</Text>
          <Text style={styles.storeLabel}>Store Name:</Text>
          <TextInput style={styles.storeInput} value={storeName} onChangeText={setStoreName} />
          <Text style={styles.storeLabel}>Store Type:</Text>
          <TextInput style={styles.storeInput} value={storeType} onChangeText={setStoreType} />
          <Text style={styles.storeLabel}>Store Description:</Text>
          <TextInput style={styles.storeInput} value={storeDescription} onChangeText={setStoreDescription} multiline />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Products</Text>
          {products.map(product => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>LKR{product.price.toFixed(2)}</Text>
                <Text style={styles.stockText}>Stock: {product.stock ? 'In Stock' : 'Out of Stock'}</Text>
                <Text style={styles.stockText}>Quantity: {product.quantity}</Text>
                <View style={styles.productActions}>
                  <TouchableOpacity onPress={() => toggleStockStatus(product.id)}>
                    <FontAwesome name={product.stock ? 'toggle-on' : 'toggle-off'} size={24} color={product.stock ? '#4CAF50' : '#FF5733'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteProduct(product.id)}>
                    <MaterialIcons name="delete" size={24} color="#FF5733" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <AntDesign name="pluscircle" size={24} color="white" />
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          <Text style={styles.feedbackText}>Customers love our products! ⭐⭐⭐⭐⭐</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal to add product */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Product</Text>
            <TextInput style={styles.storeInput} placeholder="Product Name" value={newProduct.name} onChangeText={text => setNewProduct({ ...newProduct, name: text })} />
            <TextInput style={styles.storeInput} placeholder="Price" keyboardType="numeric" value={newProduct.price} onChangeText={text => setNewProduct({ ...newProduct, price: text })} />
            <TextInput style={styles.storeInput} placeholder="Quantity" keyboardType="numeric" value={newProduct.quantity} onChangeText={text => setNewProduct({ ...newProduct, quantity: text })} />
            <TouchableOpacity style={styles.addButton} onPress={addProduct}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  card: { backgroundColor: 'white', padding: 20, margin: 10, borderRadius: 12, elevation: 5 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  storeLabel: { fontSize: 16, color: '#555', marginBottom: 5 },
  storeInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 15, width: '100%' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  productCard: { flexDirection: 'row', marginBottom: 15, padding: 10, backgroundColor: '#fff', borderRadius: 10, elevation: 3 },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, fontWeight: 'bold' },
  productPrice: { fontSize: 16, color: '#007BFF' },
  stockText: { fontSize: 16, color: '#555' },
  productActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007BFF', padding: 10, borderRadius: 5, justifyContent: 'center', marginTop: 10 },
  addButtonText: { color: 'white', fontSize: 16, marginLeft: 10 },
  feedbackText: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 10 },
  logoutButton: { backgroundColor: '#FF5733', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  logoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  cancelButton: { marginTop: 10, padding: 10, backgroundColor: '#FF5733', borderRadius: 5 },
  cancelButtonText: { color: 'white', fontSize: 16 },
});

export default StoreProfileScreen;