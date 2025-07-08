import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';

WebBrowser.maybeCompleteAuthSession();

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const HomePage = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  
  // Remplace les IDs par les tiens depuis la console Google Cloud
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '670788533243-fshmj1g5nd7v43o3b0idptpq05lb7ri1.apps.googleusercontent.com',
    androidClientId: '670788533243-fshmj1g5nd7v43o3b0idptpq05lb7ri1.apps.googleusercontent.com',
    iosClientId: '670788533243-VOTRE_VRAI_CLIENT_ID_IOS.apps.googleusercontent.com', // Remplacez ça !
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetchUserInfo(authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { // Ajoutez 'userinfo'
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      setUserInfo(user);
      Alert.alert('Connexion réussie', `Bienvenue ${user.name}`);
    } catch (error) {
      console.error('Erreur récupération utilisateur', error);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.image}>
          <View style={styles.ImgLeft}>
            <Image
              style={styles.logoProduit}
              source={require('../../assets/homepageIMG2.jpg')}
            />
          </View>
          <View style={styles.ImgCenter}>
            <Image
              style={styles.logoProduit}
              source={require('../../assets/homepageIMG.png')}
            />
          </View>
          <View style={styles.ImgRight}>
            <Image
              style={styles.logoProduit}
              source={require('../../assets/homepageIMG2.jpg')}
            />
          </View>
        </View>

        <View style={styles.TitleContainer}>
          <Text style={styles.titre}>Révolutionnez maintenant la façon de vous faire livrer</Text>
          <Text style={styles.titre}>Optez pour l'innovation logistique</Text>
        </View>

        <View style={styles.Buttons}>
          <TouchableOpacity
            style={styles.SignUpButton}
            onPress={() => navigation.navigate('choixType')}
          >
            <Image
              style={styles.logoNavBar}
              source={require('../../assets/Icons/White-Signup.png')}
            />
            <Text style={styles.buttonTextWhite}>S'inscrire avec Téléphone/Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.LoginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Image
              style={styles.logoNavBar}
              source={require('../../assets/Icons/Dark-Login.png')}
            />
            <Text style={styles.buttonTextDark}>Se connecter au compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.LoginGoogle}
            onPress={() => promptAsync()}
            disabled={!request}
          >
            <Ionicons name="logo-google" size={35} color="#111" />
            <Text style={styles.buttonTextDark}>Se connecter avec Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    marginTop: 25,
    paddingBottom: 50,
    minHeight: screenHeight - 25,
  },
  image: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: screenHeight * 0.35, // Hauteur relative à l'écran
    minHeight: 200,
    maxHeight: 300,
    position: 'relative',
  },
  ImgLeft: {
    position: 'absolute',
    bottom: screenHeight * 0.06, // Position relative
    right: screenWidth * 0.83, // Position relative
    minBottom: 20,
  },
  ImgCenter: {
    marginTop: screenHeight * 0.1, // Marge relative
    alignItems: 'center',
    maxMarginTop: 105,
  },
  ImgRight: {
    position: 'absolute',
    bottom: screenHeight * 0.07, // Position relative
    left: screenWidth * 0.83, // Position relative
    minBottom: 25,
  },
  logoProduit: {
    width: screenWidth * 0.52, // Largeur relative
    height: screenHeight * 0.28, // Hauteur relative
    maxWidth: 210,
    maxHeight: 285,
    minWidth: 160,
    minHeight: 200,
    borderRadius: 10
  },
  TitleContainer: {
    marginTop: screenHeight * 0.04, // Marge relative
    minMarginTop: 20,
    maxMarginTop: 35,
  },
  titre: {
    fontSize: screenWidth * 0.055, // Taille relative
    fontWeight: '900',
    textAlign: 'center',
    marginHorizontal: 25,
    marginTop: screenHeight * 0.025, // Marge relative
    minFontSize: 18,
    maxFontSize: 22,
    minMarginTop: 15,
    maxMarginTop: 25,
  },
  Buttons: {
    marginTop: screenHeight * 0.06, // Marge relative
    minMarginTop: 30,
    maxMarginTop: 55,
  },
  SignUpButton: {
    marginTop: screenHeight * 0.04, // Marge relative
    backgroundColor: '#000',
    borderRadius: 35,
    marginHorizontal: 15,
    flexDirection: 'row',
    height: screenHeight * 0.07, // Hauteur relative
    minHeight: 50,
    maxHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    minMarginTop: 20,
    maxMarginTop: 35,
  },
  LoginButton: {
    marginTop: screenHeight * 0.015, // Marge relative
    borderColor: '#000',
    borderWidth: 3,
    borderRadius: 35,
    marginHorizontal: 15,
    flexDirection: 'row',
    height: screenHeight * 0.07, // Hauteur relative
    minHeight: 50,
    maxHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    minMarginTop: 8,
    maxMarginTop: 10,
  },
  LoginGoogle: {
    marginTop: screenHeight * 0.015, // Marge relative
    borderColor: '#000',
    borderWidth: 3,
    borderRadius: 35,
    marginHorizontal: 15,
    flexDirection: 'row',
    height: screenHeight * 0.07, // Hauteur relative
    minHeight: 50,
    maxHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    minMarginTop: 8,
    maxMarginTop: 10,
  },
  logoNavBar: {
    marginRight: 10,
    width: 25,
    height: 25,
  },
  buttonTextWhite: {
    fontSize: screenWidth * 0.035, // Taille relative
    color: '#FFF',
    fontWeight: '600',
    minFontSize: 12,
    maxFontSize: 14,
  },
  buttonTextDark: {
    fontSize: screenWidth * 0.04, // Taille relative
    color: '#000',
    fontWeight: '600',
    marginLeft: 10,
    minFontSize: 14,
    maxFontSize: 16,
  },
});

export default HomePage;