import Vi from "dayjs/locale/vi";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";

export const navBarStyle = () => {
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
    paddingHorizontal: 8,
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
    paddingHorizontal: 4,
    borderRadius: 12,
    minHeight: 60,
  },

  activeButton: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  iconContainer: {
    marginBottom: 4,
    padding: 2,
  },

  logoNavBar: {
    width: 24,
    height: 24,
    tintColor: "#666666",
  },

  activeIcon: {
    tintColor: "#FFFFFF",
    width: 26,
    height: 26,
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
   })
}

export const navBarData = () => {
   return (
      <View>
         <View style={styleNavBar.navbar}>
              <TouchableOpacity
                style={styleNavBar.navButton}
                onPress={() => navigation.navigate("Produit")}
              >
                <View style={styleNavBar.iconContainer}>
                  <Image
                    style={styleNavBar.logoNavBar}
                    source={require("../assets/Icons/Dark-Product.png")}
                  />
                </View>
                <Text style={styleNavBar.navButtonText}>Produit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styleNavBar.navButton, styleNavBar.activeButton]}
                onPress={() => navigation.navigate("Accueil")}
              >
                <View style={styleNavBar.iconContainer}>
                  <Image
                    style={[styleNavBar.logoNavBar, styleNavBar.activeIcon]}
                    source={require("../assets/Icons/Dark-House.png")}
                  />
                </View>
                <Text style={[styleNavBar.navButtonText, styleNavBar.activeText]}>Accueil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styleNavBar.navButton}
                onPress={() => navigation.navigate("Hub")}
              >
                <View style={styleNavBar.iconContainer}>
                  <Image
                    style={styleNavBar.logoNavBar}
                    source={require("../assets/Icons/Dark-Hub.png")}
                  />
                </View>
                <Text style={styleNavBar.navButtonText}>Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styleNavBar.navButton}
                onPress={() => navigation.navigate("Profil")}
              >
                <View style={styleNavBar.iconContainer}>
                  <Image
                    style={styleNavBar.logoNavBar}
                    source={require("../assets/Icons/Dark-profile.png")}
                  />
                </View>
                <Text style={styleNavBar.navButtonText}>Profil</Text>
              </TouchableOpacity>
            </View>
      </View>
   )
}
