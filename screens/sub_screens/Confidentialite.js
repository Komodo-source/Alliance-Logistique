import React, {useState, useEffect} from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, Platform, Alert, KeyboardAvoidingView, ScrollView} from 'react-native';


const Confidentialite = ({route, navigation }) => {
    return(
        <ScrollView>
            <Text 
            style={styles.mainText}>
                Politique de confidentialité – Alliance Logistique
    Dernière mise à jour : 11/08/2025

    La présente politique de confidentialité décrit la manière dont Alliance Logistique (ci-après "l’Application", "nous" ou "notre") collecte, utilise, et protège vos données personnelles lorsque vous utilisez nos services.

    1. Collecte des informations
    Nous pouvons collecter les types de données suivants :

    Informations personnelles : nom, prénom, adresse e-mail, numéro de téléphone, identifiants de connexion.

    Données professionnelles : nom de l’entreprise, adresse, numéro SIRET, rôle/fonction.

    Données d’utilisation : informations sur la manière dont vous utilisez l’Application (journal d’activité, pages consultées, clics).

    Données techniques : adresse IP, type d’appareil, système d’exploitation, version de l’application, cookies ou identifiants similaires.

    2. Utilisation des données
    Vos données peuvent être utilisées pour :

    Fournir et améliorer nos services logistiques.

    Gérer votre compte et vos préférences.

    Communiquer avec vous (support, notifications, mises à jour).

    Garantir la sécurité et la prévention des fraudes.

    Respecter nos obligations légales et réglementaires.

    3. Partage des données
    Nous ne vendons pas vos données personnelles.
    Elles peuvent être partagées uniquement avec :

    Nos prestataires techniques (hébergeur, services cloud, support technique).

    Les autorités légales si la loi l’exige.

    Nos partenaires contractuels, uniquement lorsque cela est nécessaire à la prestation des services.

    4. Conservation des données
    Nous conservons vos informations personnelles uniquement le temps nécessaire pour :

    Fournir les services.

    Respecter nos obligations légales.

    Résoudre les litiges et faire appliquer nos accords.

    5. Sécurité des données
    Nous mettons en place des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, destruction ou altération.

    6. Cookies et technologies similaires
    L’Application peut utiliser des cookies ou des technologies équivalentes pour améliorer l’expérience utilisateur et analyser l’utilisation des services.
    Vous pouvez configurer votre appareil ou navigateur pour bloquer ou supprimer ces cookies.

    8. Modifications de la politique
    Nous pouvons mettre à jour cette politique de confidentialité à tout moment.
    La version la plus récente sera toujours disponible dans l’Application avec la date de mise à jour.


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

export default Confidentialite;