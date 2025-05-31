import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native"; // Import Image
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import TireConditionIcon from "../../assets/images/tire (1).png"; // Import your custom icon
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";

const Footer: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const scaleValue = useSharedValue(1);

  const handleNavigation = (screen: string, path: string) => {
    scaleValue.value = 1.2;
    scaleValue.value = withTiming(1, { duration: 200 });
    router.push(path);
  };

  const tabs = [
    { name: "Tire Condition", icon: "tire (1)", path: "/tire_quality_assesment/page1", customIcon: TireConditionIcon },
    { name: "Vehicle Market", icon: "car", path: "/market_prediction/page1" }, // FontAwesome5 icon
    { name: "Damage Detection", icon: "car-crash", path: "/damage_detection/page1" }, // FontAwesome5 icon

    { name: "FeedBack", icon: "comments", path: "/feedback/Home" }, // FontAwesome5 icon
  ];

  return (
    <View style={styles.footer}>
      {tabs.map((item, index) => {
        const isActive = pathname === item.path;
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: isActive ? scaleValue.value : 1 }],
        }));

        return (
          <TouchableOpacity key={index} onPress={() => handleNavigation(item.name, item.path)} style={styles.footerButton}>
            <Animated.View style={animatedStyle}>
              {item.customIcon ? ( // Check if customIcon exists
                <Image
                  source={item.customIcon}
                  style={{ width: 28, height: 28, tintColor: isActive ? "#007bff" : "gray" }} // Apply tintColor for active state
                />
              ) : (
                <FontAwesome5
                  name={item.icon as any}
                  size={28}
                  color={isActive ? "#007bff" : "gray"}
                />
              )}
            </Animated.View>
            <Text style={[styles.footerText, isActive && { color: "#007bff" }]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -3 },
  },
  footerButton: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
});

export default Footer;