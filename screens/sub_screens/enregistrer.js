import React, {useState, useEffect} from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, Platform, Alert, KeyboardAvoidingView, ScrollView} from 'react-native';
import * as FileSystem from 'expo-file-system';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//import { response } from 'express';
import * as fileManager from '../util/file-manager';
//import { SHA256 } from 'react-native-sha';
import * as Crypto from 'expo-crypto';
//import NetInfo from "@react-native-community/netinfo";
import * as Device from 'expo-device';
import * as debbug_lib from '../util/debbug.js';
//import id from 'dayjs/locale/id';
//Limport { has } from 'lodash-es';
import { getAlertRef } from '../util/AlertService';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};

//POUR TOUT LES LOGIN ET ID penser à utiliser un hash SHA-256
//il faudra mettre une confirmation par email pour les nouveaux utilisateurs
//on doit aussi checker que le mail/tel n'existe pas déjà dans la base de données

const enregistrer = ({route, navigation }) => {
  const { data } = route.params;
  const [nom, setNom] = useState('');
  const [Prenom, setPrenom] = useState('');
  const [Email, setEmail] = useState('');
  const [Tel, setTel] = useState('');
  const [Password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const id_choosen = Math.floor(Math.random() * 1000000);
  
  //const sha256 = new SHA256();
  
  const getDeviceId = async () => {
    const uniqueId = Device.osInternalBuildId || Device.modelId || Device.modelName;
    console.log("Identifiant unique :", uniqueId);
    return uniqueId;
  };

  const getIP = () => {
    return "192.128.0.1";
  }
/*}
  const getIp = () => {
    return new Promise((resolve, reject) => {
      
      NetworkInfo.getIPAddress(ip => {
        console.log("IP:", ip);
        resolve(ip);
      });
    });
  } */
  
  const AutoSave = async (form) => {
      try {
        // Nouvelle on utilise le fs de expo donc obsolète
        //
        //await AsyncStorage.setItem('user_data', JSON.stringify({
        //  id: id_choosen,
        //  type: data,
        //}));
 
        await fileManager.modify_value_local_storage(
         "name", form.nom
         ,'auto.json');
        
         await fileManager.modify_value_local_storage(
           "firstname", Prenom
           ,'auto.json');
        
           //await fileManager.modify_value_local_storage(
           //  "id", id_choosen
           //  ,'auto.json');
          
             await fileManager.modify_value_local_storage(
              "type", form.data
              ,'auto.json');

      } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
      }
  };

  const save_storage = async (data, file) => {          
        try {
          //je peux écrire dans un fichier mais je ne sais pas ou il se trouve
          //intéressant comme feature
          //je peux aussi le lire donc on va faire comme ca pour l'instant
            const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
            if (!dirInfo.exists) {
              console.log("Document directory doesn't exist");
              return;
            }            
            const fileUri = FileSystem.documentDirectory + file;
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
  const data_to_type = {
    "cl": "client",
    "fo": "fournisseur",
    "co": "coursier",
  };

  const hash_256 = async(message) => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      message
    );
  };

  const handle_user_log = async (id) => {
    try {
      //const sha256 = new SHA256();
      const deviceId = await getDeviceId();
      const ip =  getIp();
      
      const response = await fetch("https://backend-logistique-api-latest.onrender.com/user_log_manage.php", 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: id,
            device_num: deviceId ? await hash_256(deviceId) : null,
            ip_user: ip ? await hash_256(ip) : null,
          })
        }
      );
      
      console.log("User log response:", await response.json());
    } catch (error) {
      debbug_lib.debbug_log("Erreur lors de l'enregistrement de l'utilisateur dans log", 'red');
    }
  }
  
  const get_key = async (type) => {
    try {
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/create_key.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id_choosen,              
        })
      });
      
      const data = await response.json();
      console.log("data received : ", data); 
      
      if(data.message === "OK"){
        console.log("The key was created successfully"); 
        const data_sent = {
          type: data_to_type[type],
          key: data.key,
          id: id_choosen
        } 
        await save_storage(data_sent, 'key.json');       
      }else{
        console.log("The key was not created");
      }
    } catch (error) {
      console.error("Error creating key:", error);
    }
  }


  const validateForm = () => { //basiquement un check de tous les champs
    if (!nom.trim()) {
      getAlertRef().current?.showAlert('Attention', 'Veuillez entrer votre nom', true, "OK", null);
      return false;
    }
    if (!Prenom.trim()) {
      getAlertRef().current?.showAlert('Attention', 'Veuillez entrer votre prénom', true, "OK", null);
      return false;
    }
    if (!Email.trim()) {
      let averti = false
      //Alert.alert('Attention', 
      //  'Attention si vous n\'entrez pas d\'email vous ne pourrez pas récupérer le mot de passe en cas de parte'
      //, [{text: 'OK', onPress: () => averti = true }], 
      //  [{text: 'Annuler', onPress: () => null }]);


      getAlertRef().current?.showAlert(
        '⚠️Attention',
        'Attention si vous n\'entrez pas d\'email vous ne pourrez pas récupérer le mot de passe en cas de parte',
        true,
        'OK',
        () => averti = true,
        true,
        'Annuler',
        null
      );
      
        return averti; // Si l'utilisateur accepte de continuer sans email
    }
    if (!Email.includes('@') || !Email.includes('.')) {
      getAlertRef().current?.showAlert('Attention', 'Veuillez entrer un email valide', true, "OK", null);
      return false;
    }
    if (!Tel.trim()) {
      getAlertRef().current?.showAlert('Attention', 'Veuillez entrer votre numéro de téléphone', true, "OK", null);
      return false;
    }
    if (!Password.trim()) {
      getAlertRef().current?.showAlert('Attention', 'Veuillez entrer un mot de passe', true, "OK", null);
      return false;
    }
    if (Password.length < 6) {
      getAlertRef().current?.showAlert('Attention', 'Le mot de passe doit contenir au moins 6 caractères', true, "OK", null);
      return false;
    }


    return true;
  };

  const buildFormData = async () => {
    const formData = {
      id: id_choosen,
      nom,
      Prenom,
      Email: await hash_256(Email),
      Tel: await hash_256(Tel),
      Password: await hash_256(Password),
      data // pour savoir dans quelle table on l'insert
    };
    return formData;
  };



  const register = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
  
    try {
      // Build formData here, right when we need it
      const formData = await buildFormData();
      console.log("sent data : ", formData);
  
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
  
      console.log('Response status:', response.status);
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      let data;
      try {
        // Try to parse as JSON
        data = text ? JSON.parse(text) : {};
        
        if (!response.ok) {
          // Handle HTTP errors 
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
      } catch (e) {
        console.error('JSON parse error:', e);
        // If JSON parsing fails but we got text, include it in the error
        throw new Error(text || 'Invalid JSON response');
      }
  
      console.log('Parsed response:', data);
      if (data.status === 'success') {
        await AutoSave(formData);
        // Save session id to auto.json

        debbug_lib.debbug_log("formData: " + JSON.stringify(formData), "cyan");
        debbug_lib.debbug_log("data: " + JSON.stringify(data), "cyan");
        if (data.user_data) {
          await fileManager.modify_value_local_storage(
            'session_id', data.user_data.session_id, 'auto.json'
          );
        } else {
          Alert.alert('Erreur', "L'inscription a échoué : identifiant de session manquant. Veuillez réessayer.");
          setIsLoading(false);
          return;
        }
        getAlertRef().current?.showAlert(
          'Succès',
          'Voitre compte a été créé avec succès',
          true,
          'OK',
          null
        );
        if(formData.data == "fo"){
          navigation.navigate("fournisseur_produit");
        }else{
          navigation.navigate('login');
        }
        
        try {
          await get_key(data);
          await handle_user_log(id_choosen);
        } catch (error) {
          console.log("Error in post-registration tasks: ", error);
        }
      } else {
        Alert.alert('Erreure', "Une erreur est survenue lors de l'inscription");
      }
    } catch (error) {
      console.error('Error details:', error);
      if (error.message.includes("already")){ // Retourne erreur si l'email est déjà utilisé
        Alert.alert('Erreur', "Cet email a déja été utilisé pour un autre compte. Veuillez en choisir un autre.");  
      }
      Alert.alert('Erreur', "Une erreur est survenue lors de la création de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust as needed
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{fontSize : 25, fontWeight : "800", marginLeft : 15, marginBottom : 5}}>S'enregistrer</Text>
        <Text style={{fontSize : 16, fontWeight : "500", marginLeft : 25, marginBottom : 45}}>Pour continuer veuillez vous enregistrer</Text>

        <Text style={styles.descInput}>Nom</Text>
        <TextInput
          style={styles.input}
          keyboardType="default"
          placeholder="Nom"
          placeholderTextColor="#a2a2a9"
          value={nom}
          onChangeText={setNom}
        /> 

        <Text style={styles.descInput}>Prénom</Text>
        <TextInput
          style={styles.input}
          keyboardType="default"
          placeholder="Prénom"
          placeholderTextColor="#a2a2a9"
          value={Prenom}
          onChangeText={setPrenom}
        />  

        <Text style={styles.descInput}>Email</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          placeholder="Email ex: john.doe@gmail.com"
          placeholderTextColor="#a2a2a9"
          value={Email}
          onChangeText={setEmail}
        />

        <Text style={styles.descInput}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          secureTextEntry={true}
          placeholder="Mot de passe"
          placeholderTextColor="#a2a2a9"
          value={Password}
          onChangeText={setPassword}
        />

        <Text style={styles.descInput}>Téléphone</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="Téléphone ex: 0123456789"
          placeholderTextColor="#a2a2a9"
          value={Tel}
          onChangeText={setTel}
        />    

        <View style={styles.checkboxContainer}>
          {/* Checkbox code here if needed */}
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={register}
          disabled={isLoading}
        >
          <Text style={{color: "#fff", fontSize: 19, fontWeight: "500"}}>
            {isLoading ? 'Inscription en cours...' : 'S\'enregistrer'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  descInput : {
    fontSize: 14,
    marginLeft: '10%',
    fontWeight: "500"
  },
  input: {
    height: 50,
    borderWidth: 2.5,
    borderRadius: 7,
    width: '80%',
    padding: 10,
    color: '#111',
     borderColor: '#666',
    marginBottom: 20,
    marginTop: 5,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  button : {
    height: 40,
    borderRadius: 7,
    width: '80%',
    backgroundColor: '#000',
    alignSelf: 'center',
    marginTop: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 25,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '10%',
    marginBottom: 20,
  },
  checkbox: {
    marginLeft: 10,
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 3,
  },
  checked: {
    backgroundColor: '#000',
  }
});

export default enregistrer;