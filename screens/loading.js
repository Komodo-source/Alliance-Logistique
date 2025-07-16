  import React, { useEffect, useState} from 'react';
  import { View, Text, Button, StyleSheet, Image, ActivityIndicator, Alert, Platform } from 'react-native';
  //import * as dataUser from '../assealexandrie.rf.gdts/data/auto.json';
  import * as FileSystem from 'expo-file-system';
  import * as fileManager from './util/file-manager.js';
  import * as debbug_lib from './util/debbug.js';
  import * as Updates from 'expo-updates';

  
  const Loading = ({ navigation }) => {
    var is_first_time = false;
    //const [file_message, setFileMessage] = useState("");
    const [isUpdating, setisUpdating] = useState(false);
    const [version, setVersion] = useState("");

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

    //
    //
    // SYSTEME D'UPDATE OBSOLETE
    //
    //
{/**}
    const check_update = async () => {
      try {
        const dataUser = await fileManager.read_file("auto.json");
    
        const get_status = await fetch("https://api.jsonbin.io/v3/b/6875026b6063391d31ad7732", {
          method: 'GET',
          headers: {
            'X-Master-Key': '$2a$10$dBbVITXHjZD1X4jIevicPe1p8yYg.LtbFnyy4lidCYsNH/u27PPJS',
          },
        });
    
        const responseJson = await get_status.json();
        const data = responseJson.record; // Adjust depending on JSONBin structure
    
        if (data.version !== dataUser.version) {
          setisUpdating(true);
          setVersion(data.version)
          debbug_lib.debbug_log("Build was outdated: " + dataUser.version  + " -> " + data.version, "yellow");
          debbug_lib.debbug_log("Found " + data.toUpdate.length + " files to update!", "cyan");
          for (let i = 0; i < data.toUpdate.length; i++) {
            await get_file(data.toUpdate[i]); // Await file downloads
          }
             
         await fileManager.modify_value_local_storage("version", data.version, "auto.json");
         debbug_lib.debbug_log("Update finished Successfully", "green");
        }
      } catch (error) {
        debbug_lib.debbug_log("Error in update: " + error.message, 'red');
      }
    };
    
    const get_file = async (file_name) => {
      debbug_lib.debbug_log("Getting file from GitHub: " + file_name, "cyan");
    
      try {
        // Construct the raw GitHub URL dynamically
        const url = `https://github.com/LopoDistrict/Alliance-Logistique/raw/refs/heads/main/${file_name}`;
    
        const response = await fetch(url);
        //if (!response.ok) throw new Error(`Failed to fetch ${file_name}: ${response.statusText}`);
    
        const fileContent = await response.text();
    
        console.log("File fetched:", file_name.replace("screens/", ""));
        //console.log(fileContent);
    

        await fileManager.replaceFileAndWrite(fileContent, file_name.replace("screens/", ""));
    
      } catch (error) {
        debbug_lib.debbug_log("Error fetching file: " + error.message, 'red');
      }
    }; */}

    const check_update = async() => {
      try {
        console.log("Update Channel: ", Updates.channel);
        console.log("Update ID: ", Updates.updateId);
        console.log("Runtime Version: ", Updates.runtimeVersion);
        
        if (!Updates.isEnabled) {
          debbug_lib.debbug_log("Updates not enabled in this environment", "yellow");
          return;
        }
    
        const update = await Updates.checkForUpdateAsync();
        console.log("Update available: ", update.isAvailable);
        console.log("Update manifest: ", update.manifest);
        
        if (update.isAvailable) {
          setisUpdating(true);
          debbug_lib.debbug_log("Fetching update...", "blue");
          await Updates.fetchUpdateAsync();
          debbug_lib.debbug_log("Reloading app...", "blue");
          await Updates.reloadAsync();
        } else {
          debbug_lib.debbug_log("No update available", "yellow");
        }
      } catch (error) {
        debbug_lib.debbug_log("Error in update: " + error, "red");
      }
    }

    const measureFetchSpeed = async(url) => {
      const start = Date.now();
    
      const response = await fetch(url);
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

    const check_first_time = async () => {      
      const exists = await fileManager.is_file_existing("auto.json");
      if (exists) {
        debbug_lib.debbug_log("not the first time", "blue");
        return;
      } else {
        debbug_lib.debbug_log("first time ever", "red");
        is_first_time = true;
        const nv_data = {
          id: "", name: "", firstname: "", type: "", stay_logged: false, first_conn: true, version: "1.0.0"
        };
        await fileManager.save_storage_local_storage_data(nv_data, "auto.json");
      }
    }

    const loading_check = async () => {
      debbug_lib.debbug_log("INIT", "green");
      debbug_lib.debbug_log("Alliance Logistique", "green");
      debbug_lib.debbug_log("Komodo", "green");
      debbug_lib.debbug_log("v.0.4.1", "green");
      debbug_lib.debbug_log("admin version", "green");
      debbug_lib.debbug_log("loading main elements", "green");
      try{  
        debbug_lib.debbug_log("checking if persistant logging", "magenta");  
        await stay_logged();
        debbug_lib.debbug_log("checking servers", "magenta");      
        await checkServer();
      }catch(error){
        debbug_lib.debbug_log("Error in the initialisation", "red");
        setTimeout(loading_check, 1000); // prevent stack overflow
      }
    }

    const checkServer = async () => {
      try {
        const response = await measureFetchSpeed('https://google.com');
        if (response.ok) {
          debbug_lib.debbug_log("Connecté a Internet", "green");
          const response_server = await measureFetchSpeed('https://backend-logistique-api-latest.onrender.com/product.php');
          if (response_server.ok) {
            debbug_lib.debbug_log("Serveur distant/Backend Actif", "green");
            const dataUser = await fileManager.read_file("auto.json");
            debbug_lib.debbug_log("fist_conn: " + dataUser?.first_conn, "magenta")
            if (dataUser && dataUser.first_conn === true) {
              await fileManager.modify_value_local_storage("first_conn", false, "auto.json");
              navigation.reset({ index: 0, routes: [{ name: 'first_page' }] });
            } else if (!dataUser || dataUser.id === "" || dataUser.id === undefined) {
              navigation.reset({ index: 0, routes: [{ name: 'HomePage' }] });
            } else {
              navigation.reset({ index: 0, routes: [{ name: 'Accueil' }] });
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
      }catch (error) {
        if (error instanceof TypeError) {
          const data = {
            id: "", name: "", firstname: "", type: "", stay_logged: "", first_conn: true, version: "1.0.0"
          };
          await fileManager.save_storage_local_storage_data(data, "auto.json");
        } else {
          debbug_lib.debbug_log("Pas d'internet", "red");
          debbug_lib.debbug_log("Erreur: " + error, "red");
          Alert.alert('Erreur', 'Vérifiez votre connexion internet. ' + error);
          setTimeout(loading_check, 1000);
        }
      }
    };

    useEffect(() => {  
      //fileManager.modify_value_local_storage("first_conn", false, "auto.json");
      //fileManager.delete_file("auto.json");
      check_update();
      check_first_time();
      loading_check();
    }, []);

    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <Text style={styles.txtFirst}>{is_first_time ? "La première fois le chargement peut prendre quelque minute" : ""}</Text>
          <Text></Text>
          <Text style={styles.title}>Chargement...</Text>

          <Image
            style={styles.image}
            source={require('../assets/Icons/logo-Blue.jpeg')}
          />
          
        </View>
        {isUpdating ? 
          <Text style={styles.maj}>L'application fait une mise à jour. Merci de Patientez</Text> 
          : 
          <View></View>}
        <Text style={styles.versionText}>Admin Beta 1.0.1</Text>
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
    maj: {
      fontSize: 18,
      fontWeight: '600',
      textAlign:   "center",
      color : "#FFF"
    },
    txtFirst : {
      fontSize: 17,
      fontWeight: 400
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
