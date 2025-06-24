import React, {useState} from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, TextInput, Alert} from 'react-native';
import * as Device from 'expo-device';
import * as fileManager from '../util/file-manager';
import {NetworkInfo} from 'react-native-network-info';
import { SHA256 } from 'react-native-sha';
import * as debbug_lib from '../util/debbug.js';
import Checkbox from 'expo-checkbox';
//pour une araison bizarre les checkbox de react native ne fonctionnent pas
//import CheckBox from '@react-native-community/checkbox';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};

const Login = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setSelection] = useState(false);

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email', [{ text: 'OK' }]);
      return false;
    }
    if (!username.includes('@') || !username.includes('.')) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide', [{ text: 'OK' }]);
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe', [{ text: 'OK' }]);
      return false;
    }
    return true;
  };

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

  const login = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    
    const formData = {
      username,
      password
    }

    console.log("sent data : ", formData);
    
    try {
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur réseau');
      }

      const data = await response.json();
      console.log('Succès:', data);
      
      if (data.status === 'success') {
        // Save user data
        await fileManager.modify_value_local_storage(
          'id', data.user_data[`id_${data.user_type}`] // Fixed: use actual ID from response          
          //name: data.user_data[`nom_${data.user_type}`],
          //firstname: data.user_data[`prenom_${data.user_type}`]
        , 'auto.json');
        
        await fileManager.modify_value_local_storage(
          'type', data.user_type // Fixed: use actual ID from response          
          //name: data.user_data[`nom_${data.user_type}`],
          //firstname: data.user_data[`prenom_${data.user_type}`]
        , 'auto.json');


        if (isSelected){
          debbug_lib.log_debug("Persistant login", "green");
          await fileManager.add_value_to_local_storage({
            stay_loogged: true
          }, 'auto.json');
        }

        // Fixed Alert.alert call - proper format with buttons array
        Alert.alert('Succès', `Connecté en tant que: ${username}`, [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Accueil')
          }
        ]);

        try {
          // Use the actual user ID from the response
          await handle_user_log(data.user_data[`id_${data.user_type}`]);
        } catch (error) {
          console.log("[Catch] Error Log user: ", error);
        }
        
      } else {
        Alert.alert('Erreur', data.message || 'Identifiants incorrects', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={{fontSize : 25, fontWeight : "800", marginLeft : 15, marginBottom : 5}}>Se connecter</Text>
      <Text style={{fontSize : 16, fontWeight : "500", marginLeft : 25, marginBottom : 45}}>Pour continuer veuillez vous connecter</Text>

      <View style={styles.nom}>
        <Text style={styles.descInput}>Email</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#a2a2a9"
          value={username}
          onChangeText={setUsername}
        />        
      </View>

      <View style={styles.nom}>
        <Text style={styles.descInput}>Mot de Passe</Text>
        <TextInput
          style={styles.input}
          secureTextEntry={true}
          placeholder="Mot de passe"
          placeholderTextColor="#a2a2a9"
          value={password}
          onChangeText={setPassword}
        />        
      </View>

      <View style={styles.checkboxContainer}>
        <Checkbox
            style={styles.checkbox}
            value={isSelected}
            onValueChange={setSelection}
            color={isSelected ? '#2E3192' : undefined}
          />
          <Text style={{fontSize : 15, fontWeight : "500", marginLeft : 10}}>Rester connecté</Text>
      </View>
      

      <TouchableOpacity
        style={[styles.LoginButton, isLoading && styles.buttonDisabled]}
        onPress={login}
        disabled={isLoading}
      >
        <Text style={{color: "#fff", fontSize: 19, fontWeight: "500"}}>
          {isLoading ? 'Connexion en cours...' : 'Connexion'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container : {
        marginTop : 45,
    },
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
    LoginButton : {
      height: 40,
      borderRadius: 7,
      width: '80%',
      backgroundColor: '#000',
      alignSelf: 'center',
      marginTop: 20,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonDisabled: {
      backgroundColor: '#666',
    },
    checkboxContainer : {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 45,
      marginTop: 10,
      marginBottom: 10,
    }
});

export default Login;