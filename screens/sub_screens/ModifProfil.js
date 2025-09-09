import React, {useState, useEffect} from 'react';
import { View, Text, Button, StyleSheet, Keyboard, TextInput, TouchableOpacity, Modal, TouchableWithoutFeedback, ActivityIndicator} from 'react-native';
import { getAlertRef } from '../util/AlertService';
import * as fileManager from '../util/file-manager';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ModifProfil = ({route, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const ChangePasswd = async() => {
            if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
            }

            if (newPassword.length < 8) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
            return;
            }
        setIsLoading(true);
        if (newPassword !== confirmPassword) {
            getAlertRef().current?.showAlert(
              'Erreur',
              'Vos mots de passe ne correspondent pas',
              true,
              'OK',
              null
            );
            return;
        }else{
            try {
                const id = await fileManager.read_file("auto.json")["session_id"];
                const type = await fileManager.read_file("auto.json")["type"];
                const response = await fetch("https://backend-logistique-api-latest.onrender.com/change_user_mdp.php",
                    {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        session_id: id,
                        passwd: newPassword,
                        type_user: type

                    })
                    }
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log("response: ", await response.json());
                if (data.status === 'success') {
                    getAlertRef().current?.showAlert(
                        'Succès',
                        'Votre mot de passe a été changé avec succès',
                        true,
                        'OK',
                        () => navigation.navigate("Profil")
                    );
                }else{
                    getAlertRef().current?.showAlert(
                        'Erreur',
                        'Il y a une erreur de serveur, réessayer plus tard',
                        true,
                        'OK',
                        () => navigation.navigate("Profil")
                    );
                }
            }catch (error) {
                  console.error('err:', error);
                  getAlertRef().current?.showAlert(
                    'Erreur',
                    'Une erreur est survenue lors de la connexion' ,
                    true,
                    'OK',
                    null
                  );
            }
            finally {
            setIsLoading(false);
            }
        }
    }

      return (
    <View>
      <TouchableOpacity
        style={styles.changePasswordButton}
        onPress={() => setModalVisible(true)}
      >

        <MaterialCommunityIcons
            name="shield-key"
            size={20}
            color="#4A90E2"
        />
        <Text style={styles.changePasswordText}>Changer le mot de passe</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Changer le mot de passe</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >

                          <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color="#666"
                />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.descInput}>Mot de passe actuel</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.input}
                    secureTextEntry={!showCurrentPassword}
                    placeholder="Entrez votre mot de passe actuel"
                    placeholderTextColor="#a2a2a9"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.descInput}>Nouveau mot de passe</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.input}
                    secureTextEntry={!showNewPassword}
                    placeholder="Créez un nouveau mot de passe"
                    placeholderTextColor="#a2a2a9"
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                  </TouchableOpacity>
                </View>
                <Text style={styles.passwordHint}>
                  • Au moins 8 caractères
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.descInput}>Confirmer le nouveau mot de passe</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.input}
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Confirmez votre nouveau mot de passe"
                    placeholderTextColor="#a2a2a9"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >

                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.buttonDisabled]}
                onPress={ChangePasswd}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Modifier le mot de passe</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginVertical: 10,
  },
  changePasswordText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  descInput: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a2c3f0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ModifProfil;
