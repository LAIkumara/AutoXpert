import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import Header from "./components/header";
import Footer from "./components/footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const user = { name: "John Doe", photo: "https://via.placeholder.com/50" };

  return (
    <View style={styles.container}>
      <Header userName={user.name} userPhoto={user.photo} />
      <View style={styles.content}>{children}</View>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between" },
  content: { flex: 1 },
});

export default Layout;