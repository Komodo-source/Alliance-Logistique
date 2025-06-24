import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

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
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
  },
  image: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ImgLeft: {
    position: 'absolute',
    bottom: 50,
    right: 330,
  },
  ImgCenter: {
    marginTop: 105,
    alignItems: 'center',
  },
  ImgRight: {
    position: 'absolute',
    bottom: 60,
    left: 330,
  },
  logoProduit: {
    width: 210,
    height: 285,
  },
  TitleContainer: {
    marginTop: 35,
  },
  titre: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginHorizontal: 25,
    marginTop: 25,
  },
  Buttons: {
    marginTop: 55,
  },
  SignUpButton: {
    marginTop: 35,
    backgroundColor: '#000',
    borderRadius: 35,
    marginHorizontal: 15,
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  LoginButton: {
    marginTop: 10,
    borderColor: '#000',
    borderWidth: 3,
    borderRadius: 35,
    marginHorizontal: 15,
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  LoginGoogle: {
    marginTop: 10,
    borderColor: '#000',
    borderWidth: 3,
    borderRadius: 35,
    marginHorizontal: 15,
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoNavBar: {
    marginRight: 10,
    width: 25,
    height: 25,
  },
  buttonTextWhite: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  buttonTextDark: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default HomePage;
