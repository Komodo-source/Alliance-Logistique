import React, {useState} from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, TextInput, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};


const Login = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return false;
    }
    if (!username.includes('@') || !username.includes('.')) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe');
      return false;
    }
    return true;
  };

  const login = () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const formData = {
      username,
      password
    }

    console.log("sent data : ", formData);
    
    fetch('  login.php', {
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
      if (data.status === 'success') {
        // Sauvegarder les données utilisateur
        AsyncStorage.setItem('user_data', JSON.stringify({
          id: data.user_data[`id_${data.user_type}`],
          type: data.user_type,
          name: data.user_data[`nom_${data.user_type}`],
          firstname: data.user_data[`prenom_${data.user_type}`]
        }));
        
        Alert.alert('Succès', 'Connexion réussie');
        navigation.navigate('Accueil');
      } else {
        Alert.alert('Erreur', data.message || 'Identifiants incorrects');
      }
    })
    .catch(error => {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    })
    .finally(() => {
      setIsLoading(false);
    });
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
    }
});

export default Login;