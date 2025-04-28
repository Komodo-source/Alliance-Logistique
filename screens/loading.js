import React, { useEffect} from 'react';
import { View, Text, Button, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import * as dataUser from '../assets/data/auto.json';


const Loading = ({ navigation }) => {
    const checkServer = async () => {
        try {
          const response = await fetch('https://google.com');
          console.log(response);
          if (response.ok) {
            console.log('connecté a internet');
            //doit faire une requête pour savoir si le serveur est actif
            const response_server = await fetch('https://backend-logistique-api-latest.onrender.com/product.php');
            console.log(response_server);
            if(response_server.ok){
                console.log('[OK] serveur actif');                
                if(dataUser.id == "" && dataUser.type == ""){
                  //l'utilisateur n'est pas connecté
                  navigation.navigate('HomePage');  
                }else{
                  navigation.navigate('Accueil');
                  //l'utilisateur est connecté
                }
                
            }else{
                console.log('[NO] serveur inactif');
                Alert.alert('Erreur', 'Le serveur est actuellement inaccessible.');
            }
          } else {
            console.log('pas connecté a internet');
          }
        } catch (error) {
          console.log('Pas de connexion internet', error);
          Alert.alert('Erreur', 'Vérifier votre connexion internet.');
        }
      };

    useEffect(() => {  
        checkServer();
    }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>Chargement...</Text>
        <Image
          style={styles.image}
          source={require('../assets/Icons/logo-Blue.jpeg')}
        />
        <ActivityIndicator size="large" color="#035dca" style={styles.loader} />
      </View>
      <Text style={styles.versionText}>Admin Beta 0.0.3</Text>
    </View>
  );
  
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    alignItems: 'center',
    marginTop: 75,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 45,
  },
  image: {
    height: 350,
    width: 350,
    resizeMode: 'contain',
    borderRadius: 100,
    marginLeft: 20,
    marginRight: 20,
  },
  loader: {
    marginTop: 25,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
  },
});

export default Loading;
