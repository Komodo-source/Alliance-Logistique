// detail_commande_reccurente.js
import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput, Image} from 'react-native';
import * as fileManager from '../util/file-manager';
import * as debbug_lib from '../util/debbug.js';

var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

const detail_commande_reccurente = ({ route, navigation }) => {
    const { item } = route.params;
    const [commande, setCommande] = React.useState(item);
    const [searchText, setSearchText] = useState('');
    const [produits, setProduits] = useState([]);
    const [produit, setProduit] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantityModalVisible, setQuantityModalVisible] = useState(false);
    const [quantity, setQuantity] = useState('1');
    const [editingName, setEditingName] = useState(false);
    const [newCommandName, setNewCommandName] = useState(commande.nom || "Commande Anonyme");

    const getProduct = async () => {
        let data = {};
        try {
          const fileData = fileManager.read_file("product.json");
          if (fileData && Object.keys(fileData).length > 0) {
            console.log("Lecture depuis le fichier local");
            data = fileData;
          } else {
            console.log("Fichier vide ou inexistant, récupération depuis le serveur");
            const response = await fetch('https://backend-logistique-api-latest.onrender.com/product.php');
            data = await response.json();
            console.log("Produits reçus du serveur:", data);
          }
          setProduit(data);
          setProduits(data);
        } catch (error) {
          console.error("Erreur lors de la récupération des produits:", error);
        }
    };

    const handleSearchTextChange = (text) => {
        setSearchText(text);
        if (text.trim() === "") {
          setProduits(produit);
        } else {
          const filtered = produit.filter(item =>
            item.nom_produit.toLowerCase().includes(text.toLowerCase())
          );
          setProduits(filtered);
        }
    };

    const renderProductItem = ({ item }) => {
        return (
          <TouchableOpacity
            style={styles.productItem}
            onPress={() => {
              setSelectedProduct(item);
              setQuantity('1');
              setQuantityModalVisible(true);
            }}
          >
            <View style={styles.productItemContent}>
              <Text style={styles.productName}>{item.nom_produit}</Text>
              <Text style={styles.productPrice}>{item.prix_produit}FCFA</Text>
            </View>
          </TouchableOpacity>
        );
    };

    const addProductToCommand = () => {
        if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
            Alert.alert("Erreur", "Veuillez saisir une quantité valide");
            return;
        }

        // Check if product already exists in the command
        const existingProducts = commande.produits || [];
        const existingProductIndex = existingProducts.findIndex(p => p.id === selectedProduct.id_produit);

        let updatedProducts;
        if (existingProductIndex !== -1) {
            // Product exists, update quantity
            updatedProducts = [...existingProducts];
            updatedProducts[existingProductIndex] = {
                ...updatedProducts[existingProductIndex],
                quantite: updatedProducts[existingProductIndex].quantite + parseInt(quantity)
            };
        } else {
            // New product, add to list
            const newProduct = {
                id: selectedProduct.id_produit,
                nom: selectedProduct.nom_produit,
                prix: selectedProduct.prix_produit,
                quantite: parseInt(quantity)
            };
            updatedProducts = [...existingProducts, newProduct];
        }

        const updatedCommande = {
            ...commande,
            produits: updatedProducts,
            nb_produit: updatedProducts.length
        };

        setCommande(updatedCommande);
        updateCommandeInFile(updatedCommande);
        
        setQuantityModalVisible(false);
        setModalVisible(false);
        setSelectedProduct(null);
        setQuantity('1');
        setSearchText('');
        setProduits(produit);
        
        Alert.alert("Succès", existingProductIndex !== -1 ? "Quantité mise à jour" : "Produit ajouté à la commande");
    };

    const removeProductFromCommand = (index) => {
        Alert.alert(
            "Supprimer le produit",
            "Voulez-vous supprimer ce produit de la commande ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: () => {
                        const updatedProducts = [...(commande.produits || [])];
                        updatedProducts.splice(index, 1);
                        
                        const updatedCommande = {
                            ...commande,
                            produits: updatedProducts,
                            nb_produit: updatedProducts.length
                        };
                        
                        setCommande(updatedCommande);
                        updateCommandeInFile(updatedCommande);
                    }
                }
            ]
        );
    };

    const updateProductQuantity = (index, newQuantity) => {
        if (newQuantity <= 0) {
            removeProductFromCommand(index);
            return;
        }

        const updatedProducts = [...(commande.produits || [])];
        updatedProducts[index] = {
            ...updatedProducts[index],
            quantite: newQuantity
        };

        const updatedCommande = {
            ...commande,
            produits: updatedProducts
        };

        setCommande(updatedCommande);
        updateCommandeInFile(updatedCommande);
    };

    const saveCommandName = () => {
        if (!newCommandName.trim()) {
            Alert.alert("Erreur", "Le nom de la commande ne peut pas être vide");
            return;
        }

        const updatedCommande = {
            ...commande,
            nom: newCommandName.trim()
        };

        setCommande(updatedCommande);
        updateCommandeInFile(updatedCommande);
        setEditingName(false);
        Alert.alert("Succès", "Nom de la commande modifié");
    };

    const getTotalPrice = () => {
        if (!commande.produits || commande.produits.length === 0) return "0.00";
        return commande.produits.reduce((total, produit) => {
            return total + (parseFloat(produit.prix) * parseInt(produit.quantite));
        }, 0).toFixed(2);
    };

    const modifier_liste_produit = () => {
        setModalVisible(true);
    };

    useEffect(() => {        
        getProduct();
    }, []);

    const supprimer_commande = () => {
        Alert.alert(
            "Confirmer la suppression",
            "Êtes-vous sûr de vouloir supprimer cette commande récurrente ?",
            [
                {
                    text: "Annuler",
                    style: "cancel"
                },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: () => {
                        try {
                            deleteCommandeFromFile(commande.id);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert("Erreur", "Impossible de supprimer la commande");
                        }
                    }
                }
            ]
        );
    };

    const commander_maintenant = () => {
        if (!commande.produits || commande.produits.length === 0) {
            Alert.alert("Erreur", "Aucun produit dans cette commande");
            return;
        }
        
        // Debug: Log the data being passed
        console.log("Commande being passed to Formulaire:", JSON.stringify(commande, null, 2));
        console.log("Products being passed:", JSON.stringify(commande.produits, null, 2));
        
        // Ensure the data structure is correct for Formulaire
        const formattedProducts = commande.produits.map(produit => ({
            id: produit.id,
            id_produit: produit.id, // In case Formulaire expects id_produit
            nom: produit.nom,
            nom_produit: produit.nom, // In case Formulaire expects nom_produit
            prix: produit.prix,
            prix_produit: produit.prix, // In case Formulaire expects prix_produit
            quantite: produit.quantite,
            quantity: produit.quantite // In case Formulaire expects quantity
        }));
        
        navigation.navigate('Formulaire', {
            commandeRecurrente: {
                ...commande,
                produits: formattedProducts
            },
            produits: formattedProducts,
            products: formattedProducts, // Alternative key name
            isFromRecurringOrder: true, // Flag to help Formulaire identify the source
            totalProducts: formattedProducts.length,
            totalPrice: getTotalPrice()
        });
    };
    const updateCommandeInFile = (updatedCommande) => {
        try {
            let commandes = fileManager.read_file("reccurente.json") || [];
            const index = commandes.findIndex(c => c.id === updatedCommande.id);
            if (index !== -1) {
                commandes[index] = updatedCommande;
                fileManager.save_storage_local_storage_data(
                    commandes, 
                    "commande_recurrente", 
                    "reccurente.json"
                );
            }
        } catch (error) {
            debbug_lib.log("Erreur mise à jour commande:", error);
        }
    };

    const deleteCommandeFromFile = (commandeId) => {
        try {
            let commandes = fileManager.read_file("reccurente.json") || [];
            commandes = commandes.filter(c => c.id !== commandeId);
            fileManager.save_storage_local_storage_data(
                commandes, 
                "commande_recurrente", 
                "reccurente.json"
            );
        } catch (error) {
            throw error;
        }
    };

    const render_produit_commande = ({ item, index }) => {
        return (
            <View style={styles.produit_item}>
                <View style={styles.produit_info}>
                    <Text style={styles.produit_nom}>{item.nom}</Text>
                    <Text style={styles.produit_details}>
                        Prix unitaire: {parseFloat(item.prix).toFixed(2)}FCFA
                    </Text>
                    <Text style={styles.produit_total}>
                        Total: {(parseFloat(item.prix) * parseInt(item.quantite)).toFixed(2)}FCFA
                    </Text>
                </View>
                
                <View style={styles.quantity_controls}>
                    <TouchableOpacity 
                        style={styles.quantity_button}
                        onPress={() => updateProductQuantity(index, parseInt(item.quantite) - 1)}
                    >
                        <Text style={styles.quantity_button_text}>-</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.quantity_text}>{item.quantite}</Text>
                    
                    <TouchableOpacity 
                        style={styles.quantity_button}
                        onPress={() => updateProductQuantity(index, parseInt(item.quantite) + 1)}
                    >
                        <Text style={styles.quantity_button_text}>+</Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                    style={styles.remove_button}
                    onPress={() => removeProductFromCommand(index)}
                >
                    <Text style={styles.remove_button_text}>✕</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.head}>
                {editingName ? (
                    <View style={styles.edit_name_container}>
                        <TextInput
                            style={styles.name_input}
                            value={newCommandName}
                            onChangeText={setNewCommandName}
                            placeholder="Nom de la commande"
                            autoFocus={true}
                        />
                        <View style={styles.name_buttons}>
                            <TouchableOpacity 
                                style={[styles.name_button, styles.save_button]}
                                onPress={saveCommandName}
                            >
                                <Text style={styles.name_button_text}>✓</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.name_button, styles.cancel_button]}
                                onPress={() => {
                                    setEditingName(false);
                                    setNewCommandName(commande.nom || "Commande Anonyme");
                                }}
                            >
                                <Text style={styles.name_button_text}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => setEditingName(true)}>
                        <Text style={styles.title}>{commande.nom || "Commande Anonyme"}</Text>
                        <Text style={styles.edit_hint}>Appuyer pour modifier</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.id}>ID: {commande.id}</Text>
                <Text style={styles.total_price}>Total: {getTotalPrice()}FCFA</Text>
            </View>

            {/* Modal for adding products */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>              
                        <Text style={styles.inputLabel}>Rechercher vos produits</Text>
                        <View style={styles.SearchInputText}>
                            <TextInput
                                style={styles.inputTextSearch}
                                keyboardType="default"
                                placeholder="Rechercher un produit"
                                placeholderTextColor="#a2a2a9"
                                value={searchText}
                                onChangeText={handleSearchTextChange}
                            />      
                            <Image 
                                source={require('../../assets/Icons/Dark-Search.png')}
                                style={styles.imageSearch}
                            />  
                        </View>
                        
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Produits disponibles</Text>
                            <FlatList
                                data={produits}
                                keyExtractor={(item, index) => item.id_produit?.toString() || index.toString()}
                                renderItem={renderProductItem}
                                scrollEnabled={true}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <Text style={styles.emptyListText}>Aucun produit trouvé</Text>
                                }
                            />
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.closeButton} 
                            onPress={() => {
                                setModalVisible(false);
                                setSearchText('');
                                setProduits(produit);
                            }}>
                            <Text style={styles.closeButtonText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>     
            </Modal>

            {/* Modal for quantity selection */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={quantityModalVisible}
                onRequestClose={() => setQuantityModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.quantityModalView}>
                        <Text style={styles.quantityModalTitle}>
                            Ajouter {selectedProduct?.nom_produit}
                        </Text>
                        <Text style={styles.quantityModalPrice}>
                            Prix: {selectedProduct?.prix_produit}FCFA
                        </Text>
                        
                        <View style={styles.quantityInputContainer}>
                            <Text style={styles.quantityLabel}>Quantité:</Text>
                            <TextInput
                                style={styles.quantityInput}
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                                placeholder="1"
                            />
                        </View>
                        
                        <View style={styles.quantityModalButtons}>
                            <TouchableOpacity 
                                style={[styles.quantityModalButton, styles.cancelQuantityButton]}
                                onPress={() => setQuantityModalVisible(false)}
                            >
                                <Text style={styles.quantityModalButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.quantityModalButton, styles.addQuantityButton]}
                                onPress={addProductToCommand}
                            >
                                <Text style={styles.quantityModalButtonText}>Ajouter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            
            <View style={styles.options}>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={modifier_liste_produit}
                >
                    <Text style={styles.buttonText}>Ajouter des produits</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.button, styles.deleteButton]} 
                    onPress={supprimer_commande}
                >
                    <Text style={styles.buttonText}>Supprimer Commande</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.button, styles.orderButton]} 
                    onPress={commander_maintenant}
                >
                    <Text style={styles.buttonText}>Commander Maintenant</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.produits_section}>
                <Text style={styles.section_title}>
                    Produits ({commande.nb_produit || 0}) - Total: {getTotalPrice()}FCFA
                </Text>
                <FlatList
                    data={commande.produits || []}
                    renderItem={render_produit_commande}
                    keyExtractor={(item, index) => `${item.id}_${index}`}
                    scrollEnabled={true}
                    ListEmptyComponent={
                        <Text style={styles.empty_text}>Aucun produit dans cette commande</Text>
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        backgroundColor: '#d7e0f3',
        margin: 20,
        borderRadius: 15,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    quantityModalView: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 15,
        padding: 25,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    quantityModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    quantityModalPrice: {
        fontSize: 16,
        color: '#007bff',
        marginBottom: 20,
        fontWeight: '600',
    },
    quantityInputContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    quantityLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        fontWeight: '600',
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        textAlign: 'center',
        minWidth: 80,
        backgroundColor: '#f9f9f9',
    },
    quantityModalButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    quantityModalButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        minWidth: 100,
    },
    cancelQuantityButton: {
        backgroundColor: '#6c757d',
    },
    addQuantityButton: {
        backgroundColor: '#28a745',
    },
    quantityModalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E3192',
        marginBottom: 15,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    inputTextSearch: {
        height: 50,
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        color: '#333',
        backgroundColor: '#fff',
        borderColor: '#ddd',
        fontSize: 15,
    },
    sectionContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    SearchInputText: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    inputLabel: {
        color: "#555",
        marginBottom: 8,
        fontSize: 16,
        fontWeight: "600",
        textAlign: 'center',
    },
    imageSearch: {
        width: 24,
        height: 24,
    },
    productItem: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        marginVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    productItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productName: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        fontWeight: '500',
    },
    productPrice: {
        fontSize: 16,
        color: '#007bff',
        fontWeight: 'bold',
    },
    emptyListText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 20,
    },
    closeButton: {
        backgroundColor: '#2E3192',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10
    },
    head: {
        marginBottom: 20,
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 2
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    edit_hint: {
        fontSize: 12,
        color: '#007bff',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    edit_name_container: {
        width: '100%',
        alignItems: 'center',
    },
    name_input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        width: '90%',
        backgroundColor: '#fff',
    },
    name_buttons: {
        flexDirection: 'row',
        gap: 10,
    },
    name_button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    save_button: {
        backgroundColor: '#28a745',
    },
    cancel_button: {
        backgroundColor: '#dc3545',
    },
    name_button_text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    id: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    total_price: {
        fontSize: 18,
        color: '#28a745',
        fontWeight: 'bold',
    },
    options: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    button: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        minWidth: '48%'
    },
    deleteButton: {
        backgroundColor: '#dc3545'
    },
    orderButton: {
        backgroundColor: '#28a745',
        width: '100%'
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    produits_section: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        elevation: 2
    },
    section_title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15
    },
    produit_item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 10,
    },
    produit_info: {
        flex: 1,
    },
    produit_nom: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    produit_details: {
        fontSize: 14,
        color: '#666',
        marginTop: 2
    },
    produit_total: {
        fontSize: 14,
        color: '#28a745',
        fontWeight: 'bold',
        marginTop: 2
    },
    quantity_controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    quantity_button: {
        backgroundColor: '#007bff',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantity_button_text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantity_text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        minWidth: 30,
        textAlign: 'center',
    },
    remove_button: {
        backgroundColor: '#dc3545',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    remove_button_text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    empty_text: {
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
        marginTop: 20
    }
});

export default detail_commande_reccurente;