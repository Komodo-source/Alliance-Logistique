import React, {useState} from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, TextInput} from 'react-native';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};


const Login = ({ navigation }) => {

    function login(){
        const formData = {
            username,
            password
        }
        fetch('', {
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
            alert('Bien Login');
          })
          .catch(error => {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de la création du login');
          });
    }

    const [password, setPassword] = useState("");
    const [commandeName, setCommandeName] = useState('');
    const [username, setUsername] = useState('');
  return (
    <View style={styles.container}>
      <Text style={{fontSize : 25, fontWeight : "800", marginLeft : 15, marginBottom : 5}}>Se connecter</Text>
      <Text style={{fontSize : 16, fontWeight : "500", marginLeft : 25, marginBottom : 45}}>Pour continuer veuillez vous connectez</Text>

      <View style={styles.nom}>
        <Text style={styles.descInput}>Identifiant</Text>
        <TextInput
          style={styles.input}
          keyboardType="default"
          placeholder="Identifiant"
          autoFocus={true}
          placeholderTextColor="#a2a2a9"
          value={username}
          onChangeText={setUsername}
        />        
      </View>

      <View style={styles.nom}>
        <Text style={styles.descInput}>Mot de Passe</Text>
        <TextInput
          style={styles.input}
          keyboardType="password"
          secureTextEntry={true}
          placeholder="Identifiant"
          autoFocus={true}
          placeholderTextColor="#a2a2a9"
          value={password}
          onChangeText={setPassword}
        />        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container : {
        marginTop : 45,
    }
});

export default Login;