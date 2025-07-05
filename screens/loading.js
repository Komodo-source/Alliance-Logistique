  import React, { useEffect} from 'react';
  import { View, Text, Button, StyleSheet, Image, ActivityIndicator, Alert, Platform } from 'react-native';
  //import * as dataUser from '../assets/data/auto.json';
  import * as FileSystem from 'expo-file-system';
  import * as fileManager from './util/file-manager.js';
  import * as debbug_lib from './util/debbug.js';
  import axios from 'axios';

  
  const Loading = ({ navigation }) => {
    const stay_logged = async () => {
      const key = await fileManager.read_file('auto.json');
      console.log('key : ', key);
      if(key && key.stay_loogged !== true){
        debbug_lib.debbug_log('stay_logged false -> delete credentials', 'blue');
        await fileManager.modify_value_local_storage(
          "name", ""
          ,'auto.json');

          await fileManager.modify_value_local_storage(
            "firstname", ""
            ,'auto.json');

            await fileManager.modify_value_local_storage(
              "id", ""
              ,'auto.json');
      }
    }

    const measureFetchSpeed = async(url) => {
      const start = Date.now();
    
      const response = await axios.get(url);
      const data = await response.arrayBuffer();
    
      const end = Date.now();
      const durationSec = (end - start) / 1000;
      const sizeBytes = data.byteLength;
    
      const speedBps = sizeBytes / durationSec;
      const speedKbps = speedBps / 1024;
      const speedMbps = speedKbps / 1024;
      
      debbug_lib.debbug_log("Delay of Connection from: "+ url+ " servers" , 'cyan');
    
      console.log(`Downloaded ${sizeBytes} bytes in ${durationSec.toFixed(2)}s`);
      console.log(`Speed: ${speedBps.toFixed(2)} B/s`);
      console.log(`Speed: ${speedKbps.toFixed(2)} KB/s`);
      console.log(`Speed: ${speedMbps.toFixed(2)} MB/s`);
      return response;
    }

    const loading_check = async () => {
      debbug_lib.debbug_log("INIT", "green");
      debbug_lib.debbug_log("Academic Weapon", "green");
      debbug_lib.debbug_log("Komodo", "green");
      debbug_lib.debbug_log("v.0.4.1", "green");
      debbug_lib.debbug_log("admin version", "green");
      debbug_lib.debbug_log("loading main elements", "green");
      //fileManager.add_value_to_local_storage("first_conn", true, "auto.json");
      try{  
        debbug_lib.debbug_log("checking if persistant logging", "magenta");  
        await stay_logged();
        debbug_lib.debbug_log("checking servers", "magenta");      
        await checkServer();
      }catch(error){
        debbug_lib.debbug_log("Error in the initialisation", "red");
      }

    }

    const checkServer = async () => {
      try {
        const response = await measureFetchSpeed('https://google.com');
        if (response.ok) {
          debbug_lib.debbug_log("Connecté a Internet", "green");
          //doit faire une requête pour savoir si le serveur est actif
          const response_server = await measureFetchSpeed('https://backend-logistique-api-latest.onrender.com/product.php');
          if (response_server.ok) {
            debbug_lib.debbug_log("Serveur distant/Backend Actif", "green");
            //await save_storage(response_server);
            //meme si le fichier jsonn'est pas vide on envoie l'user vers la page de connexion
            // Read fresh data after stay_logged() has potentially modified it
            const dataUser = await fileManager.read_file("auto.json");
            debbug_lib.debbug_log("fist_conn: " + dataUser?.first_conn, "magenta")
            if (!dataUser || dataUser.id === "" || dataUser.id === undefined) {
              navigation.navigate('HomePage');
            }else if(dataUser.first_conn == true || dataUser.first_conn == undefined){
              await fileManager.modify_value_local_storage("first_conn", false, "auto.json");
              navigation.navigate('first_page');
            } 
            else {
              navigation.navigate('Accueil');
            }
          } else {
            debbug_lib.debbug_log("BACKEND INACCESSIBLE", "red");
            Alert.alert('Erreur', 'Le serveur est actuellement inaccessible.');
          }
        } else {
          Alert.alert(
            'Erreur de connexion',
            "Vous n'êtes pas connecté à Internet. Vérifiez votre connexion wifi ou vos données mobiles", 
            [{ text: 'Réessayer', onPress: () => checkServer() }],
            { cancelable: false },
          );
        }
      } catch (error) {
        debbug_lib.debbug_log("Pas d'internet", "red");
        debbug_lib.debbug_log("Erreur: " + error, "red");
        Alert.alert('Erreur', 'Vérifiez votre connexion internet.');
      }
    };

    useEffect(() => {  
      loading_check();
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
