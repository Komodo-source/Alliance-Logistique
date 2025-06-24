import React, {useState, useEffect} from 'react';
import {Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, Modal, FlatList, View, Button, TouchableOpacity, ScrollView, Image, Alert, PermissionsAndroid, ActivityIndicator} from 'react-native';
import * as FileSystem from 'expo-file-system';
import TomateImage from '../assets/Icons/Dark-tomato.png';
import SaladeImage from '../assets/Icons/Dark-Salad.png';
import CarotteImage from '../assets/Icons/Dark-Carrot.png';
import ChickenImage from '../assets/Icons/Dark-Chicken.png';
import LapinImage from '../assets/Icons/Rabbit.png';
import OeufImage from '../assets/Icons/Dark-oeuf.png';
import BoeufImage from '../assets/Icons/Dark-beef.png';
//import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapView,{Marker, PROVIDER_GOOGLE} from 'react-native-maps';

import * as Location from 'expo-location';
import dayjs from 'dayjs';
import DatePicker from 'react-native-ui-datepicker';

import * as dataUser from '../assets/data/auto.json';
//import { text } from 'express';

const Formulaire = ({ navigation }) => {
  const [date, setDate] = useState(dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const [poids, setPoids] = useState('');
  const [nombre, setNombre] = useState('');
  const [commandeName, setCommandeName] = useState('');
  const [description, setDescription] = useState('');
  const [childViews, setChildViews] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);
  const [isNombreFocused, setIsNombreFocused] = useState(false);
  const [isPoidsFocused, setIsPoidsFocused] = useState(false);
  const [produits, setProduits] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [region, setRegion] = useState({
    latitude: 9.3077,
    longitude: 2.3158,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.822,
  });
  const [produit, setProduit] = useState([]);
  const fileUri = FileSystem.documentDirectory + 'product.json';


  const dic_image_name = {
    "tomate": TomateImage,
    "salade": SaladeImage,
    "carotte": CarotteImage, 
    "poulet léger": ChickenImage,
    "poulet lourd": ChickenImage,
    "pintade": ChickenImage,
    "lapin": LapinImage,
    "oeuf palette(20)": OeufImage,
    "caille": ChickenImage,
    "gigot agneau": BoeufImage,
    "cote de porc": BoeufImage,
    "boeuf morceau": BoeufImage,
  };

  // Request location permission and get current location
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setHasLocationPermission(true);
        getCurrentLocation();
        return true;
      } else {
        setHasLocationPermission(false);
        Alert.alert('Permission refusée', 'Vous devez autoriser la localisation');
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getProduct = async () => {
    let data = {};
    try {
      const fileData = await readProductFile();
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
      setProduits(data); // Initialize filtered products
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
    }
  };

  const readProductFile = async () => {
    try {
      console.log('lecture du fichier:', fileUri);
  
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.warn('Fichier inexistant:', fileUri);
        return null;
      }
  
      const fileContents = await FileSystem.readAsStringAsync(fileUri);
      console.log('Contenu du fichier:', fileContents);
  
      const parsedData = JSON.parse(fileContents);
      console.log('Parse du json:', parsedData);
      
      return parsedData;
    } catch (error) {
      console.error('Error reading product.json:', error);
      if (error instanceof SyntaxError) {
        console.error('Failed to parse JSON - file may be corrupted');
      } else if (error.code === 'ENOENT') {
        console.error('File not found - path may be incorrect');
      }
      
      return null;
    }
  }

  // Fixed search function
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

  const transform_date = (date_value) => {
    const date = new Date(date_value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const normaliseDate = (date_value) => {
    const date = new Date(date_value);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert('Permission requise', 'Vous devez autoriser la localisation');
      return;
    }
    
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = location.coords;
      console.log("Current location:", latitude, longitude);
      setUserLocation({ latitude, longitude });
      setSelectedLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not get your current location');
    }
  };

  useEffect(() => {
    requestLocationPermission();
    getProduct();
  }, []);

  const handleMapPress = (e) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation(coordinate);
  };

  // Simplified product list rendering
  const renderProductItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => {
          setSelectedProduct({
            id: item.id_produit,
            key: item.nom_produit,
            originalItem: item
          });
          setModalVisible(true);
        }}
      >
        <View style={styles.productItemContent}>
          <Image
            style={styles.smallProductIcon}
            source={dic_image_name[item.nom_produit.toLowerCase()] || dic_image_name.default}
          />
          <Text style={styles.productName}>{item.nom_produit}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const add_product = (name, poids, nombre, id) => {
    setModalVisible(false);
    const newProduct = {
      id,
      name,
      productDetails: {
        ...selectedProduct.originalItem,
        nombre: nombre,
        poids: poids
      }
    };
    
    setProducts([...products, newProduct]);
    setPoids('');
    setNombre('');
  };

  // New function to remove product
  const removeProduct = (productId) => {
    Alert.alert(
      'Supprimer le produit',
      'Voulez-vous vraiment supprimer ce produit de votre commande?',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setProducts(products.filter(product => product.id !== productId));
          }
        },
      ]
    );
  };

  const handleConfirm = (selectedDate) => {
    setOpen(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleProductPress = (item) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

  const zoomOut = () => {
    setRegion(prev => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 1.2,
      longitudeDelta: prev.longitudeDelta * 1.2
    }));
  };

  const zoomIn = () => {
    setRegion(prev => ({
      ...prev,
      latitudeDelta: Math.max(prev.latitudeDelta * 0.8, 0.0001),
      longitudeDelta: Math.max(prev.longitudeDelta * 0.8, 0.0001)
    }));
  };

  const handleConfirmationCommand = () => {
    Alert.alert(
      'Validation de la commande',
      'Voulez vous vraiment valider cette commande?', 
      [
        {text: 'Oui', onPress: () => handleSubmit()},
        {text: 'Non', onPress: () => console.log('Annulation')},
      ],
      {cancelable: false},
    );
  }

  const handleSubmit = () => {
    console.log("La commande a été soumise");
    setChargement(true);
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      setChargement(false);
      return;
    }

    const formData = {
      nom_dmd: `${commandeName.replace("'", "''")}`, //pour éviter les erreurs sql
      desc_dmd: `${description.replace("'", "''")}`,
      date_fin: transform_date(date.toISOString()),
      id_client: dataUser.id, 
      localisation_dmd: `${selectedLocation.latitude};${selectedLocation.longitude}`,
      produit_contenu: products.map(product => ({
        id_produit: product.id,
        nb_produit: product.productDetails.nombre,
        poids_piece_produit: product.productDetails.poids
      }))
    };

    console.log('sent:', formData);
    fetch('https://backend-logistique-api-latest.onrender.com/create_command.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur réseau');
      }
      return response.json();
    })
    .then(data => {      
      const appel_split = fetch('https://backend-logistique-api-latest.onrender.com/split_assign.php');
      //on appel split assign pour assigner les produits aux fournisseurs
      
      console.log('Succès:', data);
      alert('Commande créée avec succès!');
      setCommandeName('');
      setDescription('');
      setDate(new Date());
      setProducts([]);
      setChildViews([]);
      setSelectedLocation(null);
      setChargement(false);
      navigation.navigate('Accueil');
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la création de la commande');
      setChargement(false);
    });
  };
  
  return(
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.textH1}>Nouvelle Commande</Text>
          
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nom de la commande</Text>
              <TextInput
                style={[styles.input, isNameFocused && styles.inputFocused]}
                placeholder="Ex: Commande pour restaurant"
                placeholderTextColor="#a2a2a9"
                value={commandeName}
                onChangeText={setCommandeName}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.inputDesc, isDescFocused && styles.inputFocused]}
                placeholder="Décrivez votre commande en détail..."
                placeholderTextColor="#a2a2a9"
                multiline
                numberOfLines={4}
                maxLength={200}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setIsDescFocused(true)}
                onBlur={() => setIsDescFocused(false)}
              />
            </View>

            {/* Date Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date de livraison</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerButtonText}>
                  {normaliseDate(date.toISOString())}
                </Text>
                <Image 
                  source={require('../assets/Icons/calendar-icon.png')} 
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Product Modal */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    Produit sélectionné: 
                  </Text>
                  <Text style={styles.modalTextSelected}>
                    {selectedProduct?.key}
                  </Text>

                  <Text style={styles.modalText}>
                    Quantité (nombre de pièces):
                  </Text>
                  <TextInput
                    style={styles.inputNB}
                    placeholder="Ex: 10"
                    keyboardType="numeric"
                    value={nombre}
                    onChangeText={setNombre}
                  />

                  <Text style={styles.modalText}>
                    Poids par pièce (en grammes):
                  </Text>
                  <TextInput
                    style={[styles.inputNB, { marginBottom: 20 }]}
                    placeholder="Ex: 150"
                    keyboardType="numeric"
                    value={poids}
                    onChangeText={setPoids}
                  />

                  <View style={styles.buttonModal}>
                    <TouchableOpacity
                      style={styles.modalButtonAnnul}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalButtonTextAnnul}>Annuler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalButtonOK}
                      onPress={() => {
                        if (nombre && poids) {
                          add_product(
                            selectedProduct.key,
                            poids,
                            nombre,
                            selectedProduct.id
                          );
                        } else {
                          Alert.alert('Erreur', 'Veuillez remplir tous les champs');
                        }
                      }}
                    >
                      <Text style={styles.modalButtonText}>Confirmer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Search Input - Fixed */}
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
                source={require('../assets/Icons/Dark-Search.png')}
                style={styles.imageSearch}
              />  
            </View>

            {/* Products List Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Produits à commander</Text>
              <FlatList
                data={produits}
                keyExtractor={(item, index) => item.id_produit?.toString() || index.toString()}
                renderItem={renderProductItem}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>Aucun produit trouvé</Text>
                }
              />
            </View>

            {/* Selected Products - Enhanced with delete functionality */}
            {products.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Produits Sélectionnés</Text>
                <View style={styles.selectedProductsContainer}>
                  {products.map((product, index) => (
                    <View key={`${product.name}-${index}`} style={styles.containerProduct}>
                      <View style={styles.productInfo}>
                        <Text style={styles.productInfoText}>
                          {product.productDetails.nombre}x {product.name} - {product.productDetails.poids}g/pièce
                        </Text>
                        <Text style={styles.categoryText}>
                          ({product.productDetails.nom_categorie})
                        </Text>
                      </View>
                      <View style={styles.productActions}>
                        <Image
                          style={styles.logoProduit}
                          source={dic_image_name[product.name.toLowerCase()]}
                        />
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => removeProduct(product.id)}
                        >
                          <Text style={styles.deleteButtonText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Delivery Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Livraison</Text>
              <Text style={styles.locationHelpText}>
                Sélectionnez le lieu de livraison sur la carte ci-dessous
              </Text>
              
              <View style={styles.locationButtons}>
                <TouchableOpacity 
                  style={styles.locationButton}
                  onPress={getCurrentLocation}
                  disabled={!hasLocationPermission}
                >
                  <Image 
                    source={require('../assets/Icons/location-icon.png')} 
                    style={styles.locationIcon}
                  />
                  <Text style={styles.locationButtonText}>Utiliser ma position</Text>
                </TouchableOpacity>
                
                <View style={styles.orDivider}>
                  <View style={styles.dividerLine}></View>
                  <Text style={styles.orText}>OU</Text>
                  <View style={styles.dividerLine}></View>
                </View>
                
                <Text style={styles.tapInstruction}>
                  Touchez la carte pour choisir manuellement
                </Text>
              </View>
              
              {/* Map Section */}
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  region={region}
                  provider={PROVIDER_GOOGLE}
                  showsUserLocation={hasLocationPermission && userLocation !== null}
                  showsMyLocationButton={false}
                  onPress={handleMapPress}
                >
                  {selectedLocation && (
                    <Marker
                      coordinate={selectedLocation}
                      title="Lieu de livraison"
                    />
                  )}
                </MapView>

                <View style={styles.mapControlsContainer}>
                  <TouchableOpacity 
                    style={styles.mapControlButton}
                    onPress={zoomIn}
                  >
                    <Text style={styles.mapControlText}>+</Text>  
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.mapControlButton}
                    onPress={zoomOut}
                  >
                    <Text style={styles.mapControlText}>-</Text>  
                  </TouchableOpacity>
                </View>
                
                {selectedLocation && (
                  <View style={styles.coordinatesContainer}>
                    <Image 
                      source={require('../assets/Icons/marker-icon.png')} 
                      style={styles.markerIcon}
                    />
                    <Text style={styles.coordinatesText}>
                      {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          
            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, chargement && styles.submitButtonDisabled]}
              onPress={handleConfirmationCommand}
              disabled={chargement}
            >
              <Text style={styles.submitButtonText}>
                {chargement ? "Envoi en cours..." : "Valider la commande"}
              </Text>
              {chargement && (
                <ActivityIndicator color="#fff" style={styles.loadingIndicator} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  productItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  smallProductIcon: {
    width: 24,
    height: 24,
    marginRight: 10
  },
  datePickerModal: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  datePickerCloseButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#45b308',
    borderRadius: 5,
  },
  datePickerCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  form: {
    marginTop: 20,
  },
  textH1: {
    fontSize: 25,
    marginTop: 20,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descInput: {
    
    color: "#000",
    marginBottom: 10,
    marginLeft: '10%',
    fontWeight: "500"
  },
  input: {
    height: 40,
    borderWidth: 2.5,
    borderRadius: 7,
    width: '100%',
    padding: 10,
    color: '#111',
    marginBottom: 20,
    marginTop: 5,
    alignSelf: 'center',
    backgroundColor: '#f8f8f8',
    borderColor: '#666',
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#333',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    fontSize: 15,
  },

  inputTextSearch : {
    height: 50,
    width: '90%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#333',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    fontSize: 15,
  },

  inputDesc: {  
    verticalAlign: "top",  
    height: 80,
    borderWidth: 2.5,
    borderRadius: 7,
    width: '80%',
    padding: 10,
    color: '#111',
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: '#f8f8f8',
    borderColor: '#666',
    
    
  },
  datePickerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  reponseCommande: {
    backgroundColor: "#45b308",
    padding: 15,
    borderRadius: 7,
    width: 180,
    height: 60,
    marginTop: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  textButton: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  listProduit: {
    minHeight: 140,
    marginTop: 20,
    marginBottom: 30,
    color: "#000",
    borderRadius: 15,
    backgroundColor: "#B8E0FF",
    padding: 15,
    
  },
  titleProd: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
    color: '#000',
    textAlign: "center"
  },
  item: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    color: '#000',
  },
  localisationText: {
    color: '#000',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalTextSelected : {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    backgroundColor: "#f8f8f8",
    padding: 10,
    width: '80%',
    textAlign: 'center',
    fontWeight: "500",
    borderRadius: 7,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  inputNB: {
    height: 40,
    borderWidth: 2.5,
    borderRadius: 7,
    width: '80%',
    padding: 10,
    color: '#111',
    marginBottom: 20,
    marginTop: 5,
    alignSelf: 'center',
    backgroundColor: '#f8f8f8',
    borderColor: '#666',
  },
  buttonModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButtonOK: {
    backgroundColor: '#45b308',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalButtonAnnul: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    borderColor: "#c51b18",
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextAnnul: {
    color: '#c51b18',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  productText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#45b308',
  },

  txtInput: {
    fontSize: 16,
    fontWeight: "400",
    marginTop: 15
  },
  inputNB: {
    width: 210,
    borderColor: "#666",
    borderWidth: 2.5,
    borderRadius: 7,
    padding: 10,
    color: '#111',
    backgroundColor: '#f8f8f8',
  },
  InputModal: {
    borderColor: "#111"
  },
  buttonModal: {
    display: "flex",
    flexDirection: "row"
  },
  containerProduct: {
    borderRadius: 7,
    backgroundColor: "#75D4F2",
    marginTop: 10,
    padding: 10,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 45,
    textAlign : "center",
    
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationButtons: {
    alignItems: 'center',
    marginTop: 10,
  },
  locationButton: {
    backgroundColor: '#45b308',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  locationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  orText: {
    marginVertical: 5,
    fontWeight: 'bold',
  },
  tapText: {
    marginBottom: 10,
    fontStyle: 'italic',
  },
  coordinatesText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  form: {
    marginTop: 15,
  },
  
  // Header
  textH1: {
    fontSize: 24,
    marginVertical: 15,
    color: '#2E3192',
    fontWeight: '700',
    textAlign: 'center',
  },
  
  // Input Fields
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#555",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },

  inputFocused: {
    borderColor: '#2E3192',
    borderWidth: 1.5,
    shadowColor: '#2E3192',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  inputDesc: {  
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    color: '#333',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    textAlignVertical: 'top',
    fontSize: 15,
  },
  
  // Date Picker
  datePickerButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerButtonText: {
    color: '#333',
    fontSize: 15,
  },
  calendarIcon: {
    width: 20,
    height: 20,
    tintColor: '#555',
  },
  
  // Section Styles
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3192',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  // Product List
  productItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  productItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallProductIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  productName: {
    fontSize: 15,
    color: '#444',
  },
  
  // Selected Products
  selectedProductsContainer: {
    marginTop: 10,
  },
  containerProduct: {
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
    marginTop: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#45b308',
  },
  
  // Location Section
  locationHelpText: {
    color: '#666',
    fontSize: 13,
    marginBottom: 15,
    textAlign: 'center',
  },
  locationButtons: {
    alignItems: 'center',
    marginBottom: 15,
  },
  locationButton: {
    backgroundColor: '#2E3192',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  locationIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
    marginRight: 8,
  },
  locationButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  orText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  tapInstruction: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },
  
  // Map Styles
  mapContainer: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  mapControlButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  controlIcon: {
    width: 20,
    height: 20,
    tintColor: '#2E3192',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  markerIcon: {
    width: 14,
    height: 14,
    tintColor: '#2E3192',
    marginRight: 6,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#555',
  },
  
  
  submitButton: {
    backgroundColor: "#45b308",
    padding: 16,
    borderRadius: 8,
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#45b308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#a0d080",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingIndicator: {
    marginLeft: 10,
  },

  mapControlsContainer: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mapControlText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3192',
  },
  SearchInputText : {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    justifyContent: 'space-around',
    
  },
  productItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  smallProductIcon: {
    width: 24,
    height: 24,
    marginRight: 10
  },
  datePickerModal: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  datePickerCloseButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#45b308',
    borderRadius: 5,
  },
  datePickerCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  form: {
    marginTop: 20,
  },
  textH1: {
    fontSize: 25,
    marginTop: 20,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descInput: {
    color: "#000",
    marginBottom: 10,
    marginLeft: '10%',
    fontWeight: "500"
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#333',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    fontSize: 15,
  },
  inputTextSearch: {
    height: 50,
    width: '90%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#333',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    fontSize: 15,
  },
  inputDesc: {  
    verticalAlign: "top",  
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    color: '#333',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    textAlignVertical: 'top',
    fontSize: 15,
  },
  datePickerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  reponseCommande: {
    backgroundColor: "#45b308",
    padding: 15,
    borderRadius: 7,
    width: 180,
    height: 60,
    marginTop: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  textButton: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  listProduit: {
    minHeight: 140,
    marginTop: 20,
    marginBottom: 30,
    color: "#000",
    borderRadius: 15,
    backgroundColor: "#B8E0FF",
    padding: 15,
  },
  titleProd: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
    color: '#000',
    textAlign: "center"
  },
  item: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    color: '#000',
  },
  localisationText: {
    color: '#000',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalTextSelected: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    backgroundColor: "#f8f8f8",
    padding: 10,
    width: '80%',
    textAlign: 'center',
    fontWeight: "500",
    borderRadius: 7,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  inputNB: {
    height: 40,
    borderWidth: 2.5,
    borderRadius: 7,
    width: '80%',
    padding: 10,
    color: '#111',
    marginBottom: 20,
    marginTop: 5,
    alignSelf: 'center',
    backgroundColor: '#f8f8f8',
    borderColor: '#666',
  },
  buttonModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButtonOK: {
    backgroundColor: '#45b308',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalButtonAnnul: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    borderColor: "#c51b18",
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextAnnul: {
    color: '#c51b18',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#45b308',
  },
  txtInput: {
    fontSize: 16,
    fontWeight: "400",
    marginTop: 15
  },
  InputModal: {
    borderColor: "#111"
  },
  containerProduct: {
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
    marginTop: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#45b308',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productInfoText: {
    fontSize: 16,
    fontWeight: "500",
    color: '#333',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
});

export default Formulaire;  