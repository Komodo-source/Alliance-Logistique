// commande_reccurente.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import * as fileManager from '../util/file-manager';
import * as debbug_lib from '../util/debbug.js';
import { useFocusEffect } from '@react-navigation/native';

var headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const commande_reccurente = ({ navigation }) => {
    const [commande, setCommande] = React.useState([]);

    useFocusEffect(
        React.useCallback(() => {
            actualiser_commande();
        }, [])
    );

    React.useEffect(() => {
        //fileManager.save_storage_local_storage_data({}, "reccurente.json"); // temp
        actualiser_commande();
    }, []);

    const randomId = function(length = 6) {
        return Math.random().toString(36).substring(2, length + 2);
    };

    const nouvelle_commande = async () => {
        try {
            const nouvelleCommande = {
                "id": randomId(),
                "nom": "Commande Anonyme", 
                "nb_produit": 0,
                "produits": ""
            };
            
            // Read existing commands
            let existingCommands = await fileManager.read_file("reccurente.json", true);
            if (!Array.isArray(existingCommands)) {
                existingCommands = [];
            }
            
            // Add new command to array
            existingCommands.push(nouvelleCommande);
            
            // Save the entire array
            await fileManager.save_storage_local_storage_data(existingCommands, "reccurente.json");
            
            actualiser_commande();
        } catch (error) {
            Alert.alert("Erreur", "Impossible de créer une nouvelle commande");
            debbug_lib.log("Erreur création commande:", error);
        }
    };

    const actualiser_commande = async () => {
        try {
            let commande_recurrente = await fileManager.read_file("reccurente.json", true);
            if (Array.isArray(commande_recurrente)) {
                setCommande(commande_recurrente);
            } else {
                setCommande([]);
            }
        } catch (error) {
            debbug_lib.log("Erreur lecture commandes:", error);
            setCommande([]);
        }
    };

// Updated renderItem with delete and rename options
const renderItem = ({ item }) => {
    return (
        <TouchableOpacity 
            style={styles.item_list}
            onPress={() => navigation.navigate('detail_commande_reccurente', { item })}
            onLongPress={() => {
                Alert.alert(
                    "Options",
                    "Que voulez-vous faire ?",
                    [
                        { text: "Annuler", style: "cancel" },
                        { text: "Renommer", onPress: () => demander_nouveau_nom(item) },
                        { text: "Supprimer", style: "destructive", onPress: () => supprimer_commande(item.id) }
                    ]
                );
            }}
        >
            <Text style={styles.item_list_text}>{item.nom}</Text>
            <Text style={styles.item_list_text}>Nombre de Produits: {item.nb_produit || 0}</Text>
        </TouchableOpacity>
    );
};
    // Add these functions to your commande_reccurente.js component

// Delete function
const supprimer_commande = async (commandeId) => {
    try {
        Alert.alert(
            "Confirmer la suppression",
            "Êtes-vous sûr de vouloir supprimer cette commande récurrente ?",
            [
                { text: "Annuler", style: "cancel" },
                { 
                    text: "Supprimer", 
                    style: "destructive",
                    onPress: async () => {
                        let existingCommands = await fileManager.read_file("reccurente.json", true);
                        if (Array.isArray(existingCommands)) {
                            const updatedCommands = existingCommands.filter(cmd => cmd.id !== commandeId);
                            await fileManager.save_storage_local_storage_data(updatedCommands, "reccurente.json");
                            debbug_lib.debbug_log("commande deleted: " + JSON.stringify(updatedCommands), "cyan");
                            actualiser_commande();
                        }
                    }
                }
            ]
        );
    } catch (error) {
        Alert.alert("Erreur", "Impossible de supprimer la commande");
        debbug_lib.log("Erreur suppression commande:", error);
    }
};

// Rename function
const renommer_commande = async (commandeId, nouveauNom) => {
    try {
        if (!nouveauNom || nouveauNom.trim() === "") {
            Alert.alert("Erreur", "Le nom ne peut pas être vide");
            return;
        }

        let existingCommands = await fileManager.read_file("reccurente.json", true);
        if (Array.isArray(existingCommands)) {
            const updatedCommands = existingCommands.map(cmd => 
                cmd.id === commandeId ? { ...cmd, nom: nouveauNom.trim() } : cmd
            );
            await fileManager.save_storage_local_storage_data(updatedCommands, "reccurente.json");
            actualiser_commande();
        }
    } catch (error) {
        Alert.alert("Erreur", "Impossible de renommer la commande");
        debbug_lib.log("Erreur renommage commande:", error);
    }
};

// Function to show rename dialog
const demander_nouveau_nom = (item) => {
    Alert.prompt(
        "Renommer la commande",
        "Entrez le nouveau nom:",
        [
            { text: "Annuler", style: "cancel" },
            { 
                text: "Renommer", 
                onPress: (nouveauNom) => renommer_commande(item.id, nouveauNom)
            }
        ],
        "plain-text",
        item.nom
    );
};



    return (
        <View style={styles.container}>
            <View style={styles.head}>
                <Text style={styles.title}>Vos commandes récurrentes</Text>
            </View>
            <View style={styles.main}>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={nouvelle_commande}
                >
                    <Text style={styles.buttonText}>Nouvelle Commande</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.commandes}>
                <FlatList
                    data={commande}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={true}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10
    },
    head: {
        marginBottom: 20,
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    main: {
        marginBottom: 20
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    commandes: {
        height: '100%'  
    },
    item_list: {
        backgroundColor: 'white',
        padding: 15,
        marginVertical: 5,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22
    },
    item_list_text: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5
    }
});

export default commande_reccurente;

