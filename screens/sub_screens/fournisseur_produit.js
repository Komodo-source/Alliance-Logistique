import React, {useState, useEffect} from 'react';
import {Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, Modal, FlatList, View, Button, TouchableOpacity, ScrollView, Image, Alert, PermissionsAndroid, ActivityIndicator, Dimensions, Animated} from 'react-native';
import * as fileManager from '../util/file-manager.js';

const fournisseur_produit = ({ navigation }) => {
    const [produits, setProduits] = useState([]);
    const [produit, setProduit] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantityModalVisible, setQuantityModalVisible] = useState(false);
    const [quantity, setQuantity] = useState('1');
    const [price, setPrice] = useState('0');
    const [supplierProducts, setSupplierProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const getProduct = async () => {
        let data = {};
        try {
          const fileData = await fileManager.read_file("product.json");
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
              setPrice('0');
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

    const addProductToSupplier = async () => {
        if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
            Alert.alert("Erreur", "Veuillez saisir une quantité valide");
            return;
        }

        if (!price || parseFloat(price) < 0) {
            Alert.alert("Erreur", "Veuillez saisir un prix valide");
            return;
        }

        // Check if product already exists in the supplier's list
        const existingProducts = supplierProducts || [];
        const existingProductIndex = existingProducts.findIndex(p => p.id === selectedProduct.id_produit);

        let updatedProducts;
        if (existingProductIndex !== -1) {
            // Product exists, update quantity and price
            updatedProducts = [...existingProducts];
            updatedProducts[existingProductIndex] = {
                ...updatedProducts[existingProductIndex],
                quantite: updatedProducts[existingProductIndex].quantite + parseInt(quantity),
                prix: parseFloat(price) // Update to new price
            };
        } else {
            // New product, add to list
            const newProduct = {
                id: selectedProduct.id_produit,
                nom: selectedProduct.nom_produit,
                prix: parseFloat(price),
                quantite: parseInt(quantity)
            };
            updatedProducts = [...existingProducts, newProduct];
        }

        setSupplierProducts(updatedProducts);
        
        setQuantityModalVisible(false);
        setModalVisible(false);
        setSelectedProduct(null);
        setQuantity('1');
        setPrice('0');
        setSearchText('');
        setProduits(produit);
        
        Alert.alert("Succès", existingProductIndex !== -1 ? "Quantité mise à jour" : "Produit ajouté à votre liste");
    };

    const removeProductFromSupplier = async (index) => {
        Alert.alert(
            "Supprimer le produit",
            "Voulez-vous supprimer ce produit de votre liste ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const updatedProducts = [...supplierProducts];
                            updatedProducts.splice(index, 1);
                            setSupplierProducts(updatedProducts);
                            Alert.alert("Succès", "Produit supprimé de votre liste");
                        } catch (error) {
                            console.error("Erreur lors de la suppression du produit:", error);
                            Alert.alert("Erreur", "Impossible de supprimer le produit");
                        }
                    }
                }
            ]
        );
    };

    const updateProductQuantity = async (index, newQuantity) => {
        if (newQuantity <= 0) {
            const updatedProducts = [...supplierProducts];
            updatedProducts.splice(index, 1);
            setSupplierProducts(updatedProducts);
            return;
        }

        const updatedProducts = [...supplierProducts];
        updatedProducts[index] = {
            ...updatedProducts[index],
            quantite: newQuantity
        };

        setSupplierProducts(updatedProducts);
    };

    const saveSupplierProducts = async () => {
        if (!supplierProducts || supplierProducts.length === 0) {
            Alert.alert("Erreur", "Aucun produit dans votre liste");
            return;
        }

        setLoading(true);
        try {
            // Get supplier ID from session or user data
            const userInfo = await fileManager.read_file("user_info.json");
            const id_fournisseur = userInfo?.id_fournisseur || 1; // Default to 1 for testing

            const list_produit = supplierProducts.map(p => p.id);
            const qte_produit = supplierProducts.map(p => p.quantite);
            const prix_produit = supplierProducts.map(p => p.prix);

            const response = await fetch('https://backend-logistique-api-latest.onrender.com/add_fournisseur_product.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_fournisseur: id_fournisseur,
                    list_produit: list_produit,
                    qte_produit: qte_produit,
                    prix_produit: prix_produit
                })
            });

            const result = await response.json();
            
            if (result.success) {
                Alert.alert("Succès", result.message, [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack()
                    }
                ]);
            } else {
                Alert.alert("Erreur", result.error || "Erreur lors de la sauvegarde");
            }
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
            Alert.alert("Erreur", "Impossible de sauvegarder les produits");
        } finally {
            setLoading(false);
        }
    };

    const getTotalProducts = () => {
        if (!supplierProducts || supplierProducts.length === 0) return 0;
        return supplierProducts.reduce((total, produit) => total + parseInt(produit.quantite), 0);
    };

    const modifier_liste_produit = () => {
        setModalVisible(true);
    };

    useEffect(() => {        
        getProduct();
    }, []);

    const render_supplier_product = ({ item, index }) => {
        return (
            <View style={styles.produit_item}>
                <View style={styles.produit_info}>
                    <Text style={styles.produit_nom}>{item.nom}</Text>
                    <Text style={styles.produit_details}>
                        Prix unitaire: {parseFloat(item.prix).toFixed(2)}FCFA
                    </Text>
                    <Text style={styles.produit_total}>
                        Quantité disponible: {item.quantite}
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
                    onPress={() => removeProductFromSupplier(index)}
                >
                    <Text style={styles.remove_button_text}>✕</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.head}>
                <Text style={styles.title}>Mes Produits</Text>
                <Text style={styles.subtitle}>Gérez les produits que vous fournissez</Text>
                <Text style={styles.total_products}>Total: {getTotalProducts()} produits</Text>
            </View>

            <View style={styles.options}>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={modifier_liste_produit}
                >
                    <Text style={styles.buttonText}>Ajouter des produits</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.button, styles.saveButton]} 
                    onPress={saveSupplierProducts}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Sauvegarde..." : "Sauvegarder"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.produits_section}>
                <Text style={styles.section_title}>
                    Produits ({supplierProducts.length}) - Total: {getTotalProducts()} unités
                </Text>
                <FlatList
                    data={supplierProducts}
                    renderItem={render_supplier_product}
                    keyExtractor={(item, index) => `${item.id}_${index}`}
                    scrollEnabled={true}
                    ListEmptyComponent={
                        <Text style={styles.empty_text}>Aucun produit dans votre liste</Text>
                    }
                />
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
                                style={styles.list_items}
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

            {/* Modal for quantity and price selection */}
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
                        
                        <View style={styles.quantityInputContainer}>
                            <Text style={styles.quantityLabel}>Quantité disponible:</Text>
                            <TextInput
                                style={styles.quantityInput}
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                                placeholder="1"
                            />
                        </View>

                        <View style={styles.quantityInputContainer}>
                            <Text style={styles.quantityLabel}>Prix unitaire (FCFA):</Text>
                            <TextInput
                                style={styles.quantityInput}
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                placeholder="0"
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
                                onPress={addProductToSupplier}
                            >
                                <Text style={styles.quantityModalButtonText}>Ajouter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
    },
    total_products: {
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
    saveButton: {
        backgroundColor: '#28a745',
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
    },
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
        marginBottom: 20,
        textAlign: 'center',
    },
    quantityInputContainer: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
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
        minWidth: 120,
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
    list_items: {
        height: 200,
    },
});

export default fournisseur_produit;