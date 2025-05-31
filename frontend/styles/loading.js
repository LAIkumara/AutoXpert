// Loading.js
import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { styles as authStyles } from '../styles/auth.styles'; // Import styles

const Loading = () => {
  return (
    <View style={authStyles.loadingContainer}>
      <LottieView
        source={require('../assets/loading.json')} // Add your loading animation file
        autoPlay
        loop
        style={authStyles.loadingAnimation}
      />
    </View>
  );
};

export default Loading;