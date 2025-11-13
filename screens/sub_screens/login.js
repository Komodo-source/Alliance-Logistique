import React, {useState, useEffect} from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, TextInput, Alert} from 'react-native';
import * as Device from 'expo-device';
import * as fileManager from '../util/file-manager';
//import {NetworkInfo} from 'react-native-network-info';
//import { SHA256 } from 'react-native-sha';
//import { sha256, sha256Bytes } from 'react-native-sha256';
import * as Crypto from 'expo-crypto'; // Added missing import
import * as debbug_lib from '../util/debbug.js';
import Checkbox from 'expo-checkbox';
//pour une araison bizarre les checkbox de react native ne fonctionnent pas
//import CheckBox from '@react-native-community/checkbox';
import { getAlertRef } from '../util/AlertService';
import { Ionicons } from '@expo/vector-icons';
import * as NotificationService from '../../NotificationService.js';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};

const Login = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setSelection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  //const sha256 = new SHA256();

  const validateForm = () => {
    if (!username.trim()) {
      getAlertRef().current?.showAlert(
        'Erreur',
        'Veuillez entrer votre email',
        true,
        'OK',
        null
      );
      return false;
    }

    if (!password.trim()) {
      getAlertRef().current?.showAlert(
        'Erreur',
        'Veuillez entrer votre mot de passe',
        true,
        'OK',
        null
      );
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
    return "127.0.0.1";
  }

  const handle_user_log = async (id) => {
    try {
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

  const hash_256 = async(message) => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      message
    );
  };

  const buildFormData = async () => {
    const formData = {
      username: username,
      password: await hash_256(password)
    };
    return formData;
  };

    const registerTokenNotificationService = async() => {
      const token = await NotificationService.registerForPushNotificationsAsync();
      await NotificationService.saveTokenToBackend(token);
      fileManager.modify_value_local_storage("token", "1", "auto.json");
    }

  const login = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // Build form data right when we need it
      const formData = await buildFormData();
      console.log("sent data : ", formData);

      const response = await fetch('https://backend-logistique-api-latest.onrender.com/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Succès:', data);

      if (data.status === 'success') {
        // Save user data

        //await fileManager.modify_value_local_storage(
        //  'id', data.user_data[`id_${data.user_type}`] // Fixed: use actual ID from response
        //, 'auto.json');

        debbug_lib.debbug_log("data.user_data[`id_${data.user_type}`]: " + data.user_data[`id_${data.user_type}`], "magenta");
        debbug_lib.debbug_log("data.user_data: " + data.user_data, "magenta");

        await fileManager.modify_value_local_storage(
          'type', data.user_type // Fixed: use actual ID from response
        , 'auto.json');

        await fileManager.modify_value_local_storage(
          'name', data.user_data[`nom_${data.user_type}`]
        , 'auto.json');

        await fileManager.modify_value_local_storage(
          'firstname', data.user_data[`prenom_${data.user_type}`]
        , 'auto.json');

        // Save session id if present
        if (data.user_data && data.user_data.session_id) {
          await fileManager.modify_value_local_storage(
            'session_id', data.user_data.session_id, 'auto.json'
          );
        } else {
          // session_id missing: show error and do not proceed
          getAlertRef().current?.showAlert(
            'Erreur',
            'La connexion a échoué : identifiant de session manquant. Veuillez réessayer.',
            true,
            'OK',
            null
          );
          setIsLoading(false);
          return;
        }

        if (isSelected){
          debbug_lib.debbug_log("Persistant login", "green");
          await fileManager.modify_value_local_storage(
            'stay_loogged', true, 'auto.json'
          );
        }
        const data = await fileManager.read_file('auto.json');
        if(!data.token || data.token === ""){
          await registerTokenNotificationService()
        }

        // Fixed Alert.alert call - proper format with buttons array
        getAlertRef().current?.showAlert(
          "Connecté",
          "Bonjour " + data.user_data[`prenom_${data.user_type}`] + " " + data.user_data[`nom_${data.user_type}`],
          true,
          "OK",
          () => navigation.navigate("Accueil")

        );

        try {
          // Use the actual user ID from the response
          await handle_user_log(data.user_data[`id_${data.user_type}`]);
        } catch (error) {
          console.log("[Catch] Error Log user: ", error);
        }

      } else {
        getAlertRef().current?.showAlert(
          'Erreur',
          data.message || 'Identifiants incorrects - Faites attention aux majuscules',
          true,
          'OK',
          null
        );
      }
    } catch (error) {
      console.error('err:', error);
      getAlertRef().current?.showAlert(
        'Erreur',
        'Une erreur est survenue lors de la connexion' ,
        true,
        'OK',
        null
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={{fontSize : 25, fontWeight : "800", marginLeft : 15, marginBottom : 5}}>Se connecter</Text>
      <Text style={{fontSize : 16, fontWeight : "500", marginLeft : 25, marginBottom : 45}}>Pour continuer veuillez vous connecter</Text>

      <View style={styles.nom}>
        <Text style={styles.descInput}>Email/Téléphone</Text>
        <TextInput
          style={styles.inputU}
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#a2a2a9"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.nom}>
        <Text style={styles.descInput}>Mot de Passe</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            placeholder="Mot de passe"
            placeholderTextColor="#a2a2a9"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={30}
              color="#666"
            />
          </TouchableOpacity>
        </View>
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

      <View style={styles.oubliVue}>
        <TouchableOpacity
        onPress={() => navigation.navigate("mdp_oubli")}

        style={styles.BouttonOubli}>
          <Text style={styles.textOubli}>Mot de Passe Oublié</Text>
        </TouchableOpacity>
      </View>

        <TouchableOpacity
        onPress={() => navigation.navigate("choixType" )}
        style={styles.oubliVue2}
        >
          <Text style={{fontWeight: 500, fontSize: 17}}>Pas encore de compte?</Text>
        </TouchableOpacity>

      <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 20}}>
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
    </View>
  );
};

const styles = StyleSheet.create({
    oubliVue : {
      alignSelf: 'center',
      marginTop: 20,
      marginBottom: 15,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

    },
    oubliVue2 : {
      marginBottom: 50,
      alignSelf: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: "#111",
      paddingBottom: 10,
      paddingTop: 10,
      width: "80%",
      borderRadius: 7
    },
    textOubli : {
      fontSize: 15,
      fontWeight: "600",
      color: "#2E3192"
    },
    container : {
        marginTop : 45,
    },
    descInput : {
      fontSize: 14,
      marginLeft: '10%',
      fontWeight: "500"
    },
    passwordContainer: {
      position: 'relative',
      width: '80%',
      alignSelf: 'center',
    },
    inputU: {
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
    input: {
      height: 50,
      borderWidth: 2.5,
      borderRadius: 7,
      width: '100%',
      padding: 10,
      paddingRight: 50,
      color: '#111',
      borderColor: '#666',
      marginBottom: 20,
      marginTop: 5,
      backgroundColor: '#fff',
    },
    eyeIcon: {
      position: 'absolute',
      right: 15,
      top: 10,
      padding: 5,
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
      bottom: 0,
      position: "static"
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
