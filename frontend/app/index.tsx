import React from "react";
import StartupScreen from "../app/StartupScreen"; // Import the startup animation screen

const Index: React.FC = () => {
  return <StartupScreen />; // Render StartupScreen as the home screen
};

export default Index;



// import React from "react";
// import { View, Text, StyleSheet, Button } from "react-native";
// import Layout from "../app/layout";
// import { styles as authStyles } from "../styles/auth.styles";
// import { useRouter } from "expo-router";

// const Dashboard: React.FC = () => {
//   const router = useRouter();

//   return (
//     <Layout>
//       <View style={styles.content}>
//         <Text style={styles.title}>Welcome to Dashboard</Text>
//         <View style={authStyles.container}>
//           <Text style={authStyles.title}>Home</Text>
        
//         </View>
//       </View>
//     </Layout>
//   );
// };

// const styles = StyleSheet.create({
//   content: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 24, fontWeight: "bold" },
// });

// export default Dashboard;


