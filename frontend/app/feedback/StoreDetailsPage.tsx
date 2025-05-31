import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Layout from '../layout';
import * as Animatable from 'react-native-animatable';
import StarRating from 'react-native-star-rating-widget';

const { width } = Dimensions.get('window');

type FeedbackItem = {
  user: string;
  comment: string;
  sentiment: 'positive' | 'negative';
};

type StoreType = {
  name: string;
  location: string;
  contact: string;
  rating: number;
  products: {
    id: string;
    name: string;
    price: string;
    image: string;
    stock: boolean;
  }[];
  feedback?: FeedbackItem[];
};

const StoreDetailsPage = () => {
  const { store } = useLocalSearchParams();
  const router = useRouter();

  const parsedStore: StoreType = JSON.parse(store as string);

  const [comment, setComment] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'positive' | 'negative'>('positive');
  const [showPopup, setShowPopup] = useState(false);

  const getPrediction = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment.');
      return;
    }

    try {
      const response = await fetch('http://192.168.184.18:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: comment }),
      });

      if (!response.ok) throw new Error('Prediction request failed');

      const data = await response.json();

      setPopupType(data.prediction === 'positive' ? 'positive' : 'negative');
      setPopupMessage(`Your feedback is ${data.prediction}.`);
      setShowPopup(true);
      setComment('');
      Keyboard.dismiss();

      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert('Error', 'Something went wrong while sending feedback.');
    }
  };

  const totalFeedback = parsedStore.feedback?.length || 0;
  const positiveFeedback = parsedStore.feedback?.filter(f => f.sentiment === 'positive').length || 0;
  const negativeFeedback = totalFeedback - positiveFeedback;
  const feedbackPercentage = totalFeedback ? (positiveFeedback / totalFeedback) * 100 : 0;
  const ratingStars = Math.round(feedbackPercentage / 20);

  const renderHeader = () => (
    <View>
      <Text style={styles.title}>{parsedStore.name}</Text>
      <Text style={styles.detail}>📍 Location: {parsedStore.location}</Text>
      <Text style={styles.detail}>📞 Contact: {parsedStore.contact}</Text>
      <Text style={styles.detail}>⭐ System Rating: {parsedStore.rating}</Text>

      <Text style={styles.subTitle}>Feedback Summary</Text>
      <Text style={styles.feedbackSummary}>
        Total: {totalFeedback} | 👍: {positiveFeedback} | 👎: {negativeFeedback}
      </Text>

      <StarRating
        rating={ratingStars}
        starSize={24}
        enableSwiping={false}
        onChange={() => {}}
      />
      <Text style={styles.feedbackSummary}>{feedbackPercentage.toFixed(1)}% Positive</Text>

      <Text style={styles.subTitle}>Available Products</Text>
    </View>
  );

  const renderFooter = () => (
    <View>
      <Text style={styles.subTitle}>Add Your Feedback</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your comment..."
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <TouchableOpacity style={styles.feedbackButton} onPress={getPrediction}>
        <Text style={styles.feedbackText}>📝 Submit Feedback</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>🔙 Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProduct = ({ item }: { item: StoreType['products'][0] }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        <Text style={[styles.stockStatus, { color: item.stock ? '#10B981' : '#EF4444' }]}>
          {item.stock ? 'In Stock' : 'Out of Stock'}
        </Text>
      </View>
    </View>
  );

  return (
    <Layout>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <FlatList
            data={parsedStore.products}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {showPopup && (
        <Animatable.View
          animation="bounceIn"
          duration={800}
          style={[
            styles.popupContainer,
            { backgroundColor: popupType === 'positive' ? '#10B981' : '#EF4444' },
          ]}
        >
          <Text style={styles.popupText}>{popupMessage}</Text>
        </Animatable.View>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, color: '#1E293B' },
  detail: { fontSize: 18, marginBottom: 5, color: '#475569' },
  subTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20, color: '#1E293B' },

  productCard: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
  productPrice: { fontSize: 16, color: '#64748B', marginVertical: 4 },
  stockStatus: { fontSize: 16, fontWeight: 'bold' },

  feedbackButton: {
    marginTop: 20,
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  feedbackText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

  backButton: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

  feedbackSummary: {
    fontSize: 16,
    color: '#475569',
    marginTop: 10,
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    height: 100,
    textAlignVertical: 'top',
  },

  popupContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default StoreDetailsPage;