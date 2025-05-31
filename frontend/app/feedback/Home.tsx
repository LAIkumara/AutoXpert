import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Layout from "../layout";

const HomePage = () => {
  const router = useRouter();

  return (
    <Layout>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>AutoXpert</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome to AutoXpert</Text>
        <Text style={styles.subtitle}>Choose your role to continue</Text>
        
        <TouchableOpacity
          style={styles.buttonOwner}
          onPress={() => router.push("/feedback/LoginScreen")}
        >
          <Ionicons name="briefcase" size={24} color="white" />
          <Text style={styles.buttonText}>Store Owner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonUser}
          onPress={() => router.push("/feedback/SearchPage")}
        >
          <Ionicons name="person" size={24} color="white" />
          <Text style={styles.buttonText}>Normal User</Text>
        </TouchableOpacity>
      </View>
    </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
  header: { padding: 20, position: "absolute", top: 50 },
  appName: { fontSize: 28, fontWeight: "bold", color: "#007bff" },
  content: { alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "gray", marginBottom: 30 },
  buttonOwner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: 200,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonUser: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    width: 200,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
});

export default HomePage;
