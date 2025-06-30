import React, {useState} from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, Platform, Alert} from 'react-native';
import * as FileSystem from 'expo-file-system';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//import { response } from 'express';
import * as fileManager from '../util/file-manager';
import { SHA256 } from 'react-native-sha';
import { NetworkInfo } from 'react-native-network-info';
import * as Device from 'expo-device';
import * as debbug_lib from '../util/debbug.js';
import id from 'dayjs/locale/id';


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
  
  const getDeviceId = async () => {
    const uniqueId = Device.osInternalBuildId || Device.modelId || Device.modelName;
    console.log("Identifiant unique :", uniqueId);
    return uniqueId;
  };

  const getIp = () => {
    return new Promise((resolve, reject) => {
      NetworkInfo.getIPAddress(ip => {
        console.log("IP:", ip);
        resolve(ip);
      });
    });
  }
  
  const AutoSave = async () => {
    //Obsolète
    if(stayLoggedIn){
      try {
        // Nouvelle on utilise le fs de expo donc obsolète
        //
        //await AsyncStorage.setItem('user_data', JSON.stringify({
        //  id: id_choosen,
        //  type: data,
        //}));
        await fileManager.save_storage_local_storage_data({
          id: id_choosen,
          type: data,
          name: nom,
          firstname: Prenom,
        }, 'auto.json');

      } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
      }
    }
  };

      const save_storage = async (data, file) => {          
          //je peux écrire dans un fichier mais je ne sais pas ou il se trouve
          //intéressant comme feature
          //je peux aussi le lire donc on va faire comme ca pour l'instant
          try {
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

  const handle_user_log = async (id) => {
    try {
      const sha256 = new SHA256();
      const deviceId = await getDeviceId();
      const ip = await getIp();
      
      const response = await fetch("https://backend-logistique-api-latest.onrender.com/user_log_manage.php", 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: id,
            device_num: deviceId ? sha256.computeHash(deviceId) : null,
            ip_user: ip ? sha256.computeHash(ip) : null,
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


  const validateForm = () => {
    if (!nom.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return false;
    }
    if (!Prenom.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre prénom');
      return false;
    }
    if (!Email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return false;
    }
    if (!Email.includes('@') || !Email.includes('.')) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return false;
    }
    if (!Tel.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return false;
    }
    if (!Password.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un mot de passe');
      return false;
    }
    if (Password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    return true;
  };
  const register = () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const formData = {
      id: id_choosen,
      nom,
      Prenom,
      Email,
      Tel,
      Password,
      data // pour savoir dans quelle table on l'insert
    }
    console.log("sent data : ", formData);
    
    fetch('https://backend-logistique-api-latest.onrender.com/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      .then(async response => {
        console.log('Response status:', response.status);
        
        // First get the raw text
        const text = await response.text();
        console.log('Raw response:', text);
        
        try {
          // Try to parse as JSON
          const data = text ? JSON.parse(text) : {};
          
          if (!response.ok) {
            // Handle HTTP errors (4xx, 5xx)
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
          }
          
          return data;
        } catch (e) {
          console.error('JSON parse error:', e);
          // If JSON parsing fails but we got text, include it in the error
          throw new Error(text || 'Invalid JSON response');
        }
      })
      .then(data => {
        console.log('Parsed response:', data);
        if (data.status === 'success') {
          AutoSave();
          Alert.alert('Succès', data.message);
          navigation.navigate('Accueil');
          try {
             get_key(data);
             handle_user_log(id_choosen);
          } catch (error) {
            console.log("Error in post-registration tasks: ", error);
          }
          
        } else {
          Alert.alert('Erreur', data.message || "Une erreur est survenue lors de l'inscription");
        }
      })
      .catch(error => {
        console.error('Error details:', error);
        Alert.alert('Erreur', error.message || "Une erreur est survenue lors de la création de l'enregistrement");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
     <View style={styles.container}>
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
          placeholder="Email"
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
          placeholder="Téléphone"
          placeholderTextColor="#a2a2a9"
          value={Tel}
          onChangeText={setTel}
        />
        
        <View style={styles.checkboxContainer}>
        {/*
          <CheckBox
            value={stayLoggedIn}
            onValueChange={setStayLoggedIn}
            style={styles.checkbox}
          />
          <Text style={styles.descInput}>Me laisser connecté</Text>*/}
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
     </View>
  );
};

const styles = StyleSheet.create({
  descInput : {
    fontSize: 14,
    marginLeft: '10%',
    fontWeight: "500"
  },
  input: {
    height: 40,
    borderWidth: 2.5,
    borderRadius: 7,
    width: '80%',
    padding: 10,
    color: '#111',
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