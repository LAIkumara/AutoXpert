import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // Install with expo install expo-linear-gradient

const Header = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const showBackButton = route.name !== "Dashboard";

  return (
    <LinearGradient
      colors={["#00B4DB", "#0083B0"]}
      style={styles.header}
    >
      {showBackButton && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>AutoXpert</Text>
        <Text style={styles.slogan}>Smart Solutions for Your Vehicle Needs</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4, // Shadow for Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    position: "absolute",
    left: 15,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  slogan: {
    fontSize: 14,
    color: "#E0F7FA",
  },
});

export default Header;