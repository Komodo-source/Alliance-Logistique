import React, {useState, useEffect} from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, Platform, Alert, KeyboardAvoidingView, ScrollView} from 'react-native';


const ProtectionDonnee = ({route, navigation }) => {
    return(
        <ScrollView>
            <Text 
            style={styles.mainText}>
                La sécurité de vos données est notre priorité.
Alliance Logistique ne collecte que les informations strictement nécessaires au fonctionnement de l’Application.
Nous ne revendons, ne louons et ne partageons pas vos données personnelles à des tiers à des fins commerciales.
Vos données ne sont utilisées ni pour de la publicité ciblée ni pour du profilage.
Elles servent uniquement à assurer le bon fonctionnement technique de l’Application et à répondre à vos demandes éventuelles.
Des mesures techniques (chiffrement, sécurisation des serveurs) et organisationnelles sont mises en place pour protéger vos informations contre tout accès non autorisé, perte ou altération.

            </Text>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    mainText : {
        fontSize: 18,
        fontWeight: "500",
        margin: 20
    }
})

export default ProtectionDonnee;