import React, {useState, useEffect} from 'react';
import { View, Text, Button, StyleSheet, Image, TextInput, TouchableOpacity, Platform, Alert, KeyboardAvoidingView, ScrollView, ActivityIndicator} from 'react-native';
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
import LeafletMap from '../../components/LeafletMap'
import * as Location from 'expo-location';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};

// POUR TOUT LES LOGIN ET ID penser à utiliser un hash SHA-256
// il faudra mettre une confirmation par email pour les nouveaux utilisateurs
// on doit aussi checker que le mail/tel n'existe pas déjà dans la base de données

const enregistrer = ({route, navigation }) => {
  const { data } = route.params;
  const [nom, setNom] = useState('');
  const [Prenom, setPrenom] = useState('');
  const [Email, setEmail] = useState('');
  const [Tel, setTel] = useState('');
  const [Password, setPassword] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [ville, setVille] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const id_choosen = Math.floor(Math.random() * 1000000);
  const [mapInteracting, setMapInteracting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 9.3077,
    longitude: 2.3158,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.822,
  });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Organization section should only show if data is "fo"
  const showOrganizationSection = data === "fo";

  //const sha256 = new SHA256();

  const getDeviceId = async () => {
    const uniqueId = Device.osInternalBuildId || Device.modelId || Device.modelName;
    console.log("Identifiant unique :", uniqueId);
    return uniqueId;
  };

  const getIP = () => {
    return "192.128.0.1";
  }

  const AutoSave = async (form) => {
      try {
        await fileManager.modify_value_local_storage(
         "name", form.nom
         ,'auto.json');

         await fileManager.modify_value_local_storage(
           "firstname", Prenom
           ,'auto.json');

             await fileManager.modify_value_local_storage(
              "type", form.data
              ,'auto.json');

      } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
      }
  };

  const save_storage = async (data, file) => {
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

  const hash_256 = async(message) => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      message
    );
  };

  const handle_user_log = async (id) => {
    try {
      const deviceId = await getDeviceId();
      const ip =  getIP();

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

  const validateForm = () => {
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

        return averti;
    }

    if(!Email.trim() && !Tel.trim()){
      getAlertRef().current?.showAlert('Attention', 'Veuillez entrer au moins un email ou numéro de téléphone', true, "OK", null);
    }else{
      if (Email && (!Email.includes('@') || !Email.includes('.'))) {
        getAlertRef().current?.showAlert('Attention', 'Veuillez entrer un email valide', true, "OK", null);
        return false;
      }else if (Email.trim()){
        return true;
      }
      else if (!Tel.trim()) {
        getAlertRef().current?.showAlert('Attention', 'Veuillez entrer votre numéro de téléphone', true, "OK", null);
        return false;
      }else{
        return true;
      }
    }
    if (!Password.trim()) {
      getAlertRef().current?.showAlert('Attention', 'Veuillez entrer un mot de passe', true, "OK", null);
      return false;
    }
    if (Password.length < 6) {
      getAlertRef().current?.showAlert('Attention', 'Le mot de passe doit contenir au moins 6 caractères', true, "OK", null);
      return false;
    }

    // Additional validation for organization if data is "fo"
    if (showOrganizationSection) {
      if (!organisation.trim()) {
        getAlertRef().current?.showAlert('Attention', 'Veuillez entrer le nom de votre organisation', true, "OK", null);
        return false;
      }
      if (!ville.trim() && !(selectedLocation.latitude && selectedLocation.longitude)) {
        getAlertRef().current?.showAlert('Attention', 'Veuillez entrer au moins une localisation de votre organisation', true, "OK", null);
        return false;
      }
    }

    return true;
  };

  const buildFormData = async () => {
    const formData = {
      id: id_choosen,
      nom,
      Prenom,
      //Email: Email ? await hash_256(Email) : '',
      Email: Email ? Email : '',
      //Tel: await hash_256(Tel),
      Tel: Tel ? Tel : '',
      Password: await hash_256(Password),
      data,
      //email_unhash: Email,
      //phone_unhash: Tel
    };

    // Add organization data only if it's a "fo" (fournisseur)
    if (showOrganizationSection) {
      formData.organisation = organisation;
      formData.ville = ville;
      formData.ville = ville;
      if (selectedLocation) {
        formData.latitude = selectedLocation.latitude;
        formData.longitude = selectedLocation.longitude;
      }
    }

    return formData;
  };

  const register = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
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
        data = text ? JSON.parse(text) : {};

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error(text || 'Invalid JSON response');
      }

      console.log('Parsed response:', data);
      if (data.status === 'success') {
        await AutoSave(formData);

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
          'Votre compte a été créé avec succès',
          true,
          'OK',
          null
        );
        if(formData.data == "fo"){
          navigation.navigate("fournisseur_produit");
        }else{
          navigation.navigate('Login');
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
      if (error.message.includes("already")){
        Alert.alert('Erreur', "Cet email a déja été utilisé pour un autre compte. Veuillez en choisir un autre.");
      }
      Alert.alert('Erreur', "Une erreur est survenue lors de la création de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  }

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        setHasLocationPermission(true);
        return true; // ✅ Do NOT call getCurrentLocation here
      } else {
        setHasLocationPermission(false);
        getAlertRef().current?.showAlert(
          "Permission refusée",
          "Vous devez autoriser la localisation",
          true,
          "Autoriser",
          null,
        );
        setIsLocationLoading(false);
        return false;
      }
    } catch (err) {
      console.error(err);
      setIsLocationLoading(false);
      return false;
    }
  };


    const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) {
        setIsLocationLoading(false);
        return;
      }
    }

    setIsLocationLoading(true);

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      console.log("Current location:", latitude, longitude);

      setSelectedLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Erreur', 'Impossible d\'obtenir votre position actuelle');
    } finally {
      setIsLocationLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>S'enregistrer</Text>
        <Text style={styles.subtitle}>Pour continuer veuillez vous enregistrer</Text>

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
          placeholder="Téléphone ex: +22954234869"
          placeholderTextColor="#a2a2a9"
          value={Tel}
          onChangeText={setTel}
        />

        {/* Conditionally render organization section */}
        {showOrganizationSection && (
          <>
            <Text style={styles.sectionTitle}>Information sur votre Organisation</Text>

            <Text style={styles.descInput}>Nom de votre Organisation</Text>
            <TextInput
              style={styles.input}
              keyboardType="default"
              placeholder="Nom Organisation"
              placeholderTextColor="#a2a2a9"
              value={organisation}
              onChangeText={setOrganisation}
            />

            <Text style={styles.descInput}>Ville de l'organisation</Text>
            <TextInput
              style={styles.input}
              keyboardType="default"
              placeholder="Ville Organisation ex: Cotonou"
              placeholderTextColor="#a2a2a9"
              value={ville}
              onChangeText={setVille}
            />

            <View style={styles.orDivider}>
              <View style={styles.dividerLine}></View>
              <Text style={styles.orText}>OU</Text>
              <View style={styles.dividerLine}></View>
            </View>

            <TouchableOpacity
              style={[styles.locationButton, isLocationLoading && styles.locationButtonDisabled]}
              onPress={() => getCurrentLocation()}
              disabled={isLocationLoading}
            >
              <Image
                source={require('../../assets/Icons/location-icon.png')}
                style={[styles.locationIcon, isLocationLoading && {opacity: 0.5}]}
              />
              {isLocationLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.locationButtonText}>Veuillez patientez</Text>
                </View>
              ) : (
                <Text style={styles.locationButtonText}>Utiliser ma position</Text>
              )}
            </TouchableOpacity>

            <View style={styles.mapContainer}>
              <LeafletMap
                latitude={selectedLocation?.latitude || region.latitude}
                longitude={selectedLocation?.longitude || region.longitude}
                selectable={true}
                onLocationChange={(coords) => setSelectedLocation(coords)}
                onMapTouchStart={() => setMapInteracting(true)}
                onMapTouchEnd={() => setMapInteracting(false)}
              />
              {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
                <View style={styles.coordinatesContainer}>
                  <Image
                    source={require('../../assets/Icons/marker-icon.png')}
                    style={styles.markerIcon}
                  />
                  <Text style={styles.coordinatesText}>
                    {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.condition}>
          <Text style={styles.condText}>
            En vous inscrivant, vous acceptez nos
            <TouchableOpacity onPress={() => navigation.navigate('Confidentialite')}>
              <Text style={styles.conditionBoutton}>Conditions générales</Text>
            </TouchableOpacity>.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={register}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Inscription en cours...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>S'enregistrer</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    marginLeft: 15,
    marginBottom: 5,
    marginTop: 20
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 25,
    marginBottom: 25
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 18,
    textAlign: "center",
    marginTop: 25,
    marginBottom: 25
  },
  sectionSubtitle: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 25,
    textAlign: "center"
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  orText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  conditionBoutton: {
    fontWeight: "600",
    color: '#1C35D4'
  },
  condition: {
    marginLeft: "10%",
    marginTop: 15,
  },
  condText: {
    fontWeight: "600",
  },
  descInput: {
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
  button: {
    height: 50,
    borderRadius: 7,
    width: '80%',
    backgroundColor: '#000',
    alignSelf: 'center',
    marginTop: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 35
  },
  buttonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "500"
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
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  mapControlButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  controlIcon: {
    width: 20,
    height: 20,
    tintColor: '#2E3192',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  markerIcon: {
    width: 14,
    height: 14,
    tintColor: '#2E3192',
    marginRight: 6,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#555',
  },
  locationButton: {
    backgroundColor: '#45b308',
    padding: 12,
    borderRadius: 7,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  locationButtonDisabled: {
    backgroundColor: '#7ec452',
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#fff',
  },
  locationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default enregistrer;
