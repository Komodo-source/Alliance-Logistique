import React from 'react';
import {Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View} from 'react-native';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};


const Formulaire = ({ navigation }) => {
  return (
    <View>
      <Text style={styles.textH1}>Formulaire de commande</Text>
        <View style={styles.form}>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
            
              <View style={styles.container}>
              <Text style={styles.descInput}>Nom de la commande</Text>
                  <TextInput
                      style={styles.input}
                      keyboardType="default"
                      placeholder="Nom commande"
                      autoFocus={true}
                      placeholderTextColor="#a2a2a9"
                  />

              <Text style={styles.descInput}>Nom de la commande</Text>
                  <TextInput
                      style={styles.inputDesc}
                      keyboardType="default"
                      placeholder="Description commande"
                      autoFocus={true}
                      placeholderTextColor="#a2a2a9"
                      multiline
                      numberOfLines={4}
                      maxLength={40}
                  />
              </View>
          </TouchableWithoutFeedback>
        </View>
    
    </View>
  );
};


const styles = StyleSheet.create({
  form: {
    paddingBlockStart: 70,
    
  },

  textH1 : {
    fontSize: 25,
    marginLeft: 20,
    marginTop: 20
  },
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#111',
  },
  descInput: {
    color: "#111",

  },
  input: {
      height: 40,
      borderColor: '#111',
      borderWidth: 3,
      borderRadius: 5,
      width: '80%',
      padding: 10,
      color: '#111',
      marginBottom: 20,
      marginTop: 10
  },
  inputDesc: {
      height: 80,
      borderColor: '#111',
      borderWidth: 3,
      borderRadius: 5,
      width: '80%',
      padding: 10,
      color: '#111',

  }
});

export default Formulaire;