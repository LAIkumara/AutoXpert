import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import LottieView from "lottie-react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Layout from "./layout";

const teamMembers = [
  { name: "Tishan Rashmika", icon: "user-tie" },
  { name: "Akila Imalsha", icon: "user-astronaut" },
  { name: "Tanishka Balamanage", icon: "user-ninja" },
  { name: "Yasith Abeykoon", icon: "user-secret" },
];

const AutoXpertDashboard = () => {
  return (
    <Layout>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AutoXpert Dashboard</Text>

      {/* Animated Section */}
      <View style={styles.animationContainer}>
        <LottieView
          source={require("../assets/dashboard.json")}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>

      {/* Who We Are */}
      <Text style={styles.sectionTitle}>Who We Are</Text>
      <Text style={styles.description}>
        AutoXpert is a smart vehicle maintenance app that connects users with reliable service providers for a seamless experience.
      </Text>

      {/* Vision & Mission */}
      <Text style={styles.sectionTitle}>Our Vision</Text>
      <Text style={styles.description}>
        To revolutionize vehicle maintenance with AI-driven insights and smart solutions.
      </Text>

      <Text style={styles.sectionTitle}>Our Mission</Text>
      <Text style={styles.description}>
        To make vehicle maintenance simple, efficient, and accessible through technology.
      </Text>

      {/* Team Members */}
      <Text style={styles.sectionTitle}>👥 Our Team</Text>
      <View style={styles.teamContainer}>
        {teamMembers.map((member, index) => (
          <View key={index} style={styles.teamMember}>
            <FontAwesome5 name={member.icon} size={50} color="#007bff" />
            <Text style={styles.teamText}>{member.name}</Text>
          </View>
        ))}
      </View>

      {/* Future Plans */}
      <Text style={styles.sectionTitle}>Future Plans</Text>
      <Text style={styles.description}>
        - Implement AI-based diagnostics{'\n'}
        - Expand to global markets{'\n'}
        - Enhance real-time tracking & support
      </Text>
    </ScrollView>
    </Layout >
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#007bff" },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginTop: 20, color: "#333" },
  description: { fontSize: 16, color: "#555", marginTop: 5, lineHeight: 22 },
  animationContainer: { alignItems: "center", marginBottom: 15 },
  animation: { width: 900, height: 300 },
  teamContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", marginTop: 10 },
  teamMember: { alignItems: "center", marginBottom: 20 },
  teamText: { fontSize: 16, fontWeight: "600", color: "#007bff", marginTop: 8 },
});

export default AutoXpertDashboard;