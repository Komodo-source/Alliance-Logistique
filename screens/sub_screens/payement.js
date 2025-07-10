import React, {useState, useEffect} from 'react';
import {Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, Modal, FlatList, View, Button, TouchableOpacity, ScrollView, Image, Alert, PermissionsAndroid, ActivityIndicator, Dimensions, Animated} from 'react-native';
import * as fileManager from '../util/file-manager.js';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

const payement = ({ navigation, route }) => {
    const [formData, setFormData] = useState({
        id: route.params.id_cmd,
        amount: route.params.amount,
        telephone: phoneNumber
      });
      const [phoneNumber, setPhoneNumber] = useState('');

      const checkStatus = async (referenceId) => {
        const response = await fetch("https://VOTRE_DOMAINE/check_status.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referenceId })
        });
      
        const data = await response.json();
        Alert.alert("Statut du paiement", `Statut : ${data.status}`);
      };


      function makeid(l) {
        // Initialize an empty string named text to store the generated random string
        var text = "";
        
        // Define a character list containing uppercase letters, lowercase letters, and digits
        var char_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        // Iterate l times to generate each character in the random string
        for (var i = 0; i < l; i++) {
          // Append a randomly selected character from char_list to the text string
          text += char_list.charAt(Math.floor(Math.random() * char_list.length));
        }
        return text;
      }

      const handlePayment = async () => {
        if (!phoneNumber) {
          Alert.alert('Erreur', 'Veuillez entrer un numéro MoMo');
          return;
        }
    
        try {
          const response = await fetch('https://backend-logistique-api-latest.onrender/pay.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber })
          });
    
          const data = await response.json();
    
            if (data.status === 'initiated') {
            Alert.alert('Paiement en cours', `Référence: ${data.referenceId}`);
            setTimeout(() => checkStatus(data.referenceId), 5000); // Attendre 5 sec avant de vérifier
            }else {
            Alert.alert('Erreur', 'Échec de la demande');
          }
        } catch (err) {
          console.error(err);
          Alert.alert('Erreur', 'Échec de la communication avec le serveur');
        }
      };

      return (
        <View style={{ padding: 30 }}>
          <Text>Numéro MoMo (ex: 2250700000000)</Text>
          <TextInput
            style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
            keyboardType="phone-pad"
            placeholder="Entrez le numéro"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <Button title="Payer 10€" onPress={handlePayment} />
        </View>
      );
}
const styles = StyleSheet.create({
    
});

export default payement;