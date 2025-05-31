import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";

const StartupScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>AutoXpert</Text>
      <Text style={styles.slogan}>Smart Solutions for Your Vehicle Needs</Text>
      <LottieView
        source={require("../assets/car-animation.json")} // Use the downloaded JSON
        autoPlay
        loop
        style={styles.animation}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/AutoXpertDashboard")} // Navigate to the dashboard
      >
        <Text style={styles.buttonText}>Let's Go</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa", // Light gray background for a modern look
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  slogan: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 20,
  },
  animation: {
    width: 388,
    height: 420,
  },
  button: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default StartupScreen;