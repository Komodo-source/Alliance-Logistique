import React, {useState} from 'react';
import { View, Text, Button, StyleSheet, TextInput} from 'react-native';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};


const enregistrer = ({route, navigation }) => {
  const { data } = route.params;
  const [nom, setNom] = useState('');
  const [Prenom, setPrenom] = useState('');
  const [Email, setEmail] = useState('');
  const [Tel, setTel] = useState('');
  const [Password, setPassword] = useState('');

  function register(){
    const formData = {
      nom,
      Prenom,
      Email,
      Tel,
      Password,
      data //pour savoir dans quelle table on l'insert
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
        alert('Bien Enregistrer');
        
      })
      .catch(error => {
        console.error('Erreur:', error);
        alert("Une erreur est survenue lors de la création de l'enregistrement");
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
          //autoFocus={true}
          placeholderTextColor="#a2a2a9"
          value={nom}
          onChangeText={setNom}
        />        

        <Text style={styles.descInput}>Prénom</Text>
        <TextInput
          style={styles.input}
          keyboardType="default"
          placeholder="Prénom"
          //autoFocus={true}
          placeholderTextColor="#a2a2a9"
          value={Prenom}
          onChangeText={setPrenom}
        />  

        <Text style={styles.descInput}>Email</Text>
        <TextInput
          style={styles.input}
          keyboardType="default"
          placeholder="Email"
          //autoFocus={true}
          placeholderTextColor="#a2a2a9"
          value={Email}
          onChangeText={setEmail}
        />

        <Text style={styles.descInput}>Téléphone</Text>
        <TextInput
          style={styles.input}
          keyboardType="default"
          placeholder="Téléphone"
          //autoFocus={true}
          placeholderTextColor="#a2a2a9"
          value={Tel}
          onChangeText={setTel}
        />

        <Text style={styles.descInput}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          keyboardType="default"
          placeholder="Mot de passe"
          //autoFocus={true}
          placeholderTextColor="#a2a2a9"
          value={Password}
          onChangeText={setPassword}
        />
      
     </View>
  );
};

const styles = StyleSheet.create({
  
});

export default enregistrer;