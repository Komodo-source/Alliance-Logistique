  import React, { useEffect} from 'react';
  import { View, Text, Button, StyleSheet, Image, ActivityIndicator, Alert, Platform } from 'react-native';
  import * as dataUser from '../assets/data/auto.json';
  import * as FileSystem from 'expo-file-system';


  const Loading = ({ navigation }) => {

    const save_storage = async (response) => {
      //je peux écrire dans un fichier mais je ne sais pas ou il se trouve
      //intéressant comme feature
      //je peux aussi le lire donc on va faire comme ca pour l'instant
      try {
        const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
        if (!dirInfo.exists) {
          console.log("Document directory doesn't exist");
          return;
        }
        const data = await response.json();
        const fileUri = FileSystem.documentDirectory + 'product.json';
        console.log('Data:', data);
        const jsonString = JSON.stringify(data);
        
        console.log('Full file path:', fileUri);
        await FileSystem.writeAsStringAsync(fileUri, jsonString, {
          encoding: FileSystem.EncodingType.UTF8
        });
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          console.log('fichier ecris:', fileInfo.uri, 'Size:', fileInfo.size);

          const fileContents = await FileSystem.readAsStringAsync(fileUri);
          console.log('File contents:', fileContents);
        } else {
          console.log('File write operation completed but file not found');
        }
      } catch (error) {
        console.error('Error during file operation:', error);
        if (error.message) console.error('Error message:', error.message);
        if (error.stack) console.error('Error stack:', error.stack);
      }
      
    };


    const checkServer = async () => {
      try {
        const response = await fetch('https://google.com');
        console.log(response);
        if (response.ok) {
          console.log('connecté a internet');
          //doit faire une requête pour savoir si le serveur est actif
          const response_server = await fetch('https://backend-logistique-api-latest.onrender.com/product.php');
          console.log(response_server);
          ;
          if(response_server.ok){
            console.log('[OK] serveur actif'); 
            save_storage(response_server);
            //meme si le fichier jsonn'est pas vide on envoie l'user vers la page de connexion
            if(dataUser.id == "" && dataUser.type == ""){
              //l'utilisateur n'est pas connecté
              
              avigation.navigate('HomePage');  
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
      backgroundColor : "#2E3192"
    },
    container: {
      alignItems: 'center',
      marginTop: 75,
    },
    title: {
      fontSize: 25,
      fontWeight: '800',
      marginBottom: 45,
      color : "#FFF"
    },
    image: {
      height: 350,
      width: 350,
      resizeMode: 'contain',
      borderRadius: 100,
      marginLeft: 20,
      marginRight: 20,
    },
    versionText: {
      textAlign: 'center',
      fontSize: 12,
      color: '#888',
    },
  });

  export default Loading;
