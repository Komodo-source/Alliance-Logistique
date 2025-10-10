import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";


export const NavBarData = ({ navigation, active_page }) => {
  const styleNavBar = StyleSheet.create({
    navbar: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: 12,
      backgroundColor: "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor: "#F1F5F9",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 10,
    },
    navButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      borderRadius: 12,
      minHeight: 60,
    },
    activeButton: {
      backgroundColor: "#3B82F6",
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    iconContainer: {
      marginBottom: 4,
      padding: 2,
    },
    navButtonText: {
      fontSize: 12,
      fontWeight: "500",
      color: "#666666",
      textAlign: "center",
    },
    activeText: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
  });

  const tabs = [
    {
      name: "Produit",
      page: "produit",
      icon: <FontAwesome name="shopping-basket" size={24} />,
      navigate: "Produit",
    },
    {
      name: "Accueil",
      page: "accueil",
      icon: <MaterialCommunityIcons name="home" size={28} />,
      navigate: "Accueil",
    },
    {
      name: "Hub",
      page: "hub",
      icon: <FontAwesome5 name="receipt" size={24} />,
      navigate: "Hub",
    },
    {
      name: "Profil",
      page: "profil",
      icon: <Ionicons name="person-sharp" size={24} />,
      navigate: "Profil",
    },
  ];

  return (
    <View style={styleNavBar.navbar}>
      {tabs.map((tab, index) => {
        const isActive = active_page === tab.page;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styleNavBar.navButton,
              isActive && styleNavBar.activeButton,
            ]}
            onPress={() => navigation.navigate(tab.navigate)}
          >
            <View style={styleNavBar.iconContainer}>
              {React.cloneElement(tab.icon, {
                color: isActive ? "#ffffff" : "#000000",
              })}
            </View>
            <Text
              style={[
                styleNavBar.navButtonText,
                isActive && styleNavBar.activeText,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
