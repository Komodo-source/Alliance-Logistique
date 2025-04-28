import React, {useState} from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, Platform, Alert} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
  const AutoSave = async () => {
    if(stayLoggedIn){
      try {
        await AsyncStorage.setItem('user_data', JSON.stringify({
          id: id_choosen,
          type: data,
        }));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
      }
    }
  };

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
      data //pour savoir dans quelle table on l'insert
    }
    console.log("sent data : ", formData);
    
    fetch('https://backend-logistique-api-latest.onrender.com/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur réseau');
        }
        return response.json();
      })
      .then(data => {
        console.log('Succès:', data);
        if (data.message === 'message') { // ici c'est message parce que c'est un message de succès
          AutoSave();
          Alert.alert('Succès', 'Inscription réussie');
          navigation.navigate('Accueil');
        } else {
          Alert.alert('Erreur', data.message || "Une erreur est survenue lors de l'inscription");
        }
      })
      .catch(error => {
        console.error('Erreur:', error);
        Alert.alert('Erreur', "Une erreur est survenue lors de la création de l'enregistrement");
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
          />*/}
          <Text style={styles.descInput}>Me laisser connecté</Text>
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