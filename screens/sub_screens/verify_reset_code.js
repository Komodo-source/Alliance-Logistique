import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { getAlertRef } from '../util/AlertService';

var headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const VerifyResetCode = ({ route, navigation }) => {
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1); // 1: verify code, 2: set new password
    const { email } = route.params;

    const verifyCode = async () => {
        try {
            const response = await fetch('https://backend-logistique-api-latest.onrender.com/confirm_reset_email.php', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ code: code })
            });
            
            const result = await response.json();
            
            if (result.success) {
                setStep(2); // Move to password reset step
            } else {
                getAlertRef().current?.showAlert(
                    "Erreur",
                    "Code incorrect",
                    true,
                    "OK"
                );
            }
        } catch(error) {
            getAlertRef().current?.showAlert(
                "Erreur",
                "Erreur de connexion",
                true,
                "OK"
            );
        }
    };

    const resetPassword = async () => {
        if (newPassword !== confirmPassword) {
            getAlertRef().current?.showAlert(
                "Erreur",
                "Les mots de passe ne correspondent pas",
                true,
                "OK"
            );
            return;
        }

        if (newPassword.length < 6) {
            getAlertRef().current?.showAlert(
                "Erreur",
                "Le mot de passe doit contenir au moins 6 caractères",
                true,
                "OK"
            );
            return;
        }

        try {
            const response = await fetch('https://backend-logistique-api-latest.onrender.com/reset_password.php', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    code: code,
                    new_password: newPassword
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                getAlertRef().current?.showAlert(
                    "Succès",
                    "Mot de passe mis à jour avec succès",
                    true,
                    "OK",
                    () => navigation.navigate("HomePage")
                );
            } else {
                getAlertRef().current?.showAlert(
                    "Erreur",
                    result.error || "Erreur lors de la mise à jour",
                    true,
                    "OK"
                );
            }
        } catch(error) {
            getAlertRef().current?.showAlert(
                "Erreur",
                "Erreur de connexion",
                true,
                "OK"
            );
        }
    };

    if (step === 1) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Vérification du code</Text>
                <Text style={styles.subtitle}>
                    Entrez le code envoyé à {email}
                </Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Code à 4 chiffres"
                    keyboardType="numeric"
                    value={code}
                    onChangeText={setCode}
                    maxLength={4}
                />
                
                <TouchableOpacity style={styles.button} onPress={verifyCode}>
                    <Text style={styles.buttonText}>Vérifier</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Nouveau mot de passe</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Nouveau mot de passe"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />
            
            <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            
            <TouchableOpacity style={styles.button} onPress={resetPassword}>
                <Text style={styles.buttonText}>Mettre à jour</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        color: '#666'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 15,
        marginVertical: 10,
        borderRadius: 5,
        fontSize: 16
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default VerifyResetCode;