import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, TextInput} from 'react-native';
import { getAlertRef } from '../util/AlertService';
import fileManager from '../util/file-manager';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};

const mdp_oubli = ({ route, navigation }) => {
    const [Identifiant, setIdentifiant] = useState("");

    const fetchNewMdp = async () => {
        try {
            const data = await fileManager.read_file("auto.json");
            const response = await fetch('https://backend-logistique-api-latest.onrender.com/reset_email.php', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ email: Identifiant})
            });

            console.log(JSON.stringify({ email: Identifiant}));

            const result = await response.json();

            if (result.success) {
                getAlertRef().current?.showAlert(
                    "Procédure de réintialisation",
                    "Un code de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.",
                    true,
                    "OK",
                    () => {navigation.navigate("VerifyResetCode", { email: Identifiant })}
                );
            } else {
                getAlertRef().current?.showAlert(
                    "Erreur",
                    result.error || "Une erreur s'est produite lors de l'envoi du code.",
                    true,
                    "OK"
                );
            }
        } catch(error) {
            console.error("Erreur lors de la récupération du mot de passe :", error);
            getAlertRef().current?.showAlert(
                "Erreur",
                "Erreur de connexion au serveur",
                true,
                "OK"
            );
        }
    }

    const handleContinuer = () => {
        if(Identifiant != ""){
            fetchNewMdp();
        } else {
            getAlertRef().current?.showAlert(
                "Attention",
                "Vous devez entrez une adresse email",
                true,
                "OK"
            );
        }
    }

    return (
        <View style={styles.body}>
            <View style={styles.header}>
                <Text style={styles.title}>Retrouver votre compte Alliance Logistique</Text>
                <Text style={styles.subtitle}>Dites-nous en plus sur votre compte.</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Saisissez votre adresse email.</Text>
                <TextInput
                style={styles.input}
                placeholder="test@gmail.com"
                keyboardType="email-address"
                value={Identifiant}
                onChangeText={setIdentifiant}
                />
                <TouchableOpacity
                style={styles.button}
                onPress={handleContinuer}>
                    <Text style={styles.buttonText}>Continuer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    body: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    header: {
        marginBottom: 30
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 25
    },
    subtitle: {
        fontSize: 16,
        color: '#666'
    },
    formContainer: {
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        marginBottom: 10
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 12,
        marginBottom: 20,
        fontSize: 16
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default mdp_oubli;
