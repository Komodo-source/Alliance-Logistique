import React, {useState, useEffect} from 'react';
import {Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, Modal, FlatList, View, Button, TouchableOpacity, ScrollView, Image, Alert, PermissionsAndroid, ActivityIndicator, Dimensions, Animated} from 'react-native';
import * as fileManager from '../util/file-manager.js';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

const payement = ({ navigation, route }) => {
    const [formData, setFormData] = useState({
        id: route.params.command_data?.id_cmd || route.params.id_cmd,
        amount: route.params.amount || route.params.command_data?.amount || 1000,
        telephone: '',
    });
      const [phoneNumber, setPhoneNumber] = useState('');
      const [RefId, setRefId] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [isValidNumber, setIsValidNumber] = useState(false);

      // Validate phone number format
      const validatePhoneNumber = (number) => {
        const phoneRegex = /^225[0-9]{8}$/;
        return phoneRegex.test(number);
      };

      const handlePhoneNumberChange = (text) => {
        setPhoneNumber(text);
        setIsValidNumber(validatePhoneNumber(text));
      };

      const checkStatus = async (referenceId) => {
        try {
          const response = await fetch('https://backend-logistique-api-latest.onrender.com/status.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ referenceId })
          });
      
          const result = await response.json();
          console.log("Statut du paiement:", result.status);
      
          if (result.status === 'SUCCESSFUL') {
            Alert.alert('✅ Paiement Réussi', 'Merci pour votre paiement !');
            try{
              const response = await fetch('https://backend-logistique-api-latest.onrender.com/confirm_paying.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                  idcmd: formData.id, 
                  number: phoneNumber, 
                  externalId: referenceId, 
                  amount: formData.amount 
                })
              });
              
              const confirmResult = await response.json();
              if (confirmResult.ok) {
                Alert.alert('Paiement enregistré', 'Le paiement a été enregistré avec succès.');
                // Retourner à la page précédente
                navigation.goBack();
              } else {
                Alert.alert('Erreur', 'Erreur lors de l\'enregistrement du paiement');
              }
            }catch (err) {
              console.error(err);
              Alert.alert('Erreur', 'Échec de la communication avec le serveur');
            }

          } else if (result.status === 'FAILED') {
            Alert.alert('❌ Paiement Échoué', 'Le paiement n\'a pas été complété.');
          } else {
            Alert.alert('⏳ Paiement en attente', 'Le paiement est toujours en cours, veuillez vérifier plus tard.');
          }
        } catch (error) {
          console.error(error);
          Alert.alert('Erreur', 'Impossible de vérifier le statut du paiement');
        }
      };

      function makeid(l) {
        var text = "";
        var char_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < l; i++) {
          text += char_list.charAt(Math.floor(Math.random() * char_list.length));
        }
        return text;
      }

      const handlePayment = async () => {
        if (!phoneNumber) {
          Alert.alert('Erreur', 'Veuillez entrer un numéro MoMo');
          return;
        }
      
        if (!isValidNumber) {
          Alert.alert('Erreur', 'Format de numéro invalide. Utilisez le format: 2250XXXXXXXX');
          return;
        }
      
        setIsLoading(true);
      
        try {
          const response = await fetch('https://backend-logistique-api-latest.onrender.com/payement.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              phoneNumber: phoneNumber,
              amount: formData.amount.toString()
            })
          });
      
          const data = await response.json();
          console.log("Référence de la transaction:", data.referenceId);
      
          if (data.referenceId) {
            Alert.alert('Paiement en cours', `Référence: ${data.referenceId}`);
            setTimeout(() => checkStatus(data.referenceId), 5000); // delay to give MTN time to process
          } else {
            Alert.alert('Erreur', 'Échec de la demande de paiement');
          }
        } catch (err) {
          console.error(err);
          Alert.alert('Erreur', 'Échec de la communication avec le serveur');
        } finally {
          setIsLoading(false);
        }
      };
      

      

      return (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Paiement Sécurisé</Text>
            <View style={styles.securityBadge}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>Connexion sécurisée SSL</Text>
            </View>
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Détails du paiement</Text>
              <View style={styles.secureLabel}>
                <Text style={styles.secureLabelText}>🛡️ Sécurisé</Text>
              </View>
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Montant à payer</Text>
              <Text style={styles.amountValue}>{formData.amount} FCFA</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Numéro Mobile Money (MOMO)</Text>
              <Text style={styles.inputHint}>Format: 2250XXXXXXXX</Text>
              <View style={[styles.inputContainer, isValidNumber && styles.validInput]}>
                <Text style={styles.countryCode}>🇨🇮 +225</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="phone-pad"
                  placeholder="0701234567"
                  value={phoneNumber.replace('225', '')}
                  onChangeText={(text) => handlePhoneNumberChange('225' + text)}
                  maxLength={11}
                />
                {isValidNumber && <Text style={styles.validIcon}>✓</Text>}
              </View>
              {phoneNumber && !isValidNumber && (
                <Text style={styles.errorText}>Format invalide</Text>
              )}
            </View>

            <View style={styles.securityInfo}>
              <Text style={styles.securityInfoTitle}>🔐 Votre sécurité est notre priorité</Text>
              <Text style={styles.securityInfoText}>
                • Cryptage SSL 256-bit{'\n'}
                • Aucune donnée stockée{'\n'}
                • Conforme aux normes bancaires
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.payButton, (!isValidNumber || isLoading) && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={!isValidNumber || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.payButtonText}>
                    🔒 Payer {formData.amount} FCFA
                  </Text>
                  <Text style={styles.payButtonSubtext}>Paiement sécurisé</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.trustIndicators}>
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>🛡️</Text>
                <Text style={styles.trustText}>Sécurisé</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>⚡</Text>
                <Text style={styles.trustText}>Instantané</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>✅</Text>
                <Text style={styles.trustText}>Fiable</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              En continuant, vous acceptez nos conditions de service.
              {'\n'}Vos données sont protégées par un cryptage de niveau bancaire.
            </Text>
          </View>
        </ScrollView>
      );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f7fa',
    },
    header: {
      backgroundColor: '#fff',
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#e1e8ed',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1a202c',
      textAlign: 'center',
      marginBottom: 10,
    },
    securityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#e6fffa',
      borderRadius: 20,
      paddingVertical: 5,
      paddingHorizontal: 15,
      alignSelf: 'center',
    },
    securityIcon: {
      fontSize: 14,
      marginRight: 5,
    },
    securityText: {
      fontSize: 12,
      color: '#047857',
      fontWeight: '600',
    },
    paymentCard: {
      backgroundColor: '#fff',
      margin: 20,
      borderRadius: 15,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1a202c',
    },
    secureLabel: {
      backgroundColor: '#dcfce7',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    secureLabelText: {
      fontSize: 12,
      color: '#166534',
      fontWeight: '600',
    },
    amountSection: {
      alignItems: 'center',
      marginBottom: 20,
    },
    amountLabel: {
      fontSize: 14,
      color: '#6b7280',
      marginBottom: 5,
    },
    amountValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#059669',
    },
    divider: {
      height: 1,
      backgroundColor: '#e5e7eb',
      marginVertical: 20,
    },
    inputSection: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 5,
    },
    inputHint: {
      fontSize: 12,
      color: '#6b7280',
      marginBottom: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#d1d5db',
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 12,
      backgroundColor: '#f9fafb',
    },
    validInput: {
      borderColor: '#10b981',
      backgroundColor: '#f0fdf4',
    },
    countryCode: {
      fontSize: 16,
      color: '#374151',
      marginRight: 10,
      fontWeight: '600',
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: '#1f2937',
    },
    validIcon: {
      fontSize: 16,
      color: '#10b981',
      fontWeight: 'bold',
    },
    errorText: {
      fontSize: 12,
      color: '#ef4444',
      marginTop: 5,
    },
    securityInfo: {
      backgroundColor: '#f8fafc',
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: '#3b82f6',
    },
    securityInfoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1e40af',
      marginBottom: 8,
    },
    securityInfoText: {
      fontSize: 12,
      color: '#475569',
      lineHeight: 18,
    },
    payButton: {
      backgroundColor: '#059669',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#059669',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    payButtonDisabled: {
      backgroundColor: '#9ca3af',
      shadowOpacity: 0,
      elevation: 0,
    },
    payButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 2,
    },
    payButtonSubtext: {
      fontSize: 12,
      color: '#d1fae5',
    },
    trustIndicators: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
    trustItem: {
      alignItems: 'center',
    },
    trustIcon: {
      fontSize: 20,
      marginBottom: 5,
    },
    trustText: {
      fontSize: 12,
      color: '#6b7280',
      fontWeight: '600',
    },
    footer: {
      padding: 20,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 11,
      color: '#6b7280',
      textAlign: 'center',
      lineHeight: 16,
    },
});

export default payement;