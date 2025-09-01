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
//import MapView,{Marker} from 'react-native-maps';
import LeafletMap from '../components/LeafletMap';
import { getAlertRef } from './util/AlertService';
import Snackbar from './util/SnackBar.js';
import { useRef } from 'react';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import * as Location from 'expo-location';
import dayjs from 'dayjs';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as debbug_lib from './util/debbug.js';
import * as fileManager from './util/file-manager.js';
import axios from 'axios';
import { SafeAreaView } from 'react-native';


const Formulaire = ({ navigation, route}) => {
  
  let pre_selected_item = null;
  console.log("route"+  route);
  if (route && route.params && route.params.produits) {
    pre_selected_item = route.params.produits;
    console.log("produit deja selec à partir d'un panier");
    console.log(route.params.produits);
  }
  
  // Fixed date state management
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [date, setDate] = useState(new Date());
  //const [tempDate, setTempDate] = useState(dayjs()); // Temporary date for modal
  //const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  //const [open, setOpen] = useState(false);
  //const [poids, setPoids] = useState('');
  const [nombre, setNombre] = useState('');
  const [commandeName, setCommandeName] = useState('');
  const [description, setDescription] = useState('');
  //const [childViews, setChildViews] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);
  //const [isNombreFocused, setIsNombreFocused] = useState(false);
  //const [isPoidsFocused, setIsPoidsFocused] = useState(false);
  const [produits, setProduits] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [region, setRegion] = useState({
    latitude: 9.3077,
    longitude: 2.3158,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.822,
  });
  const [addresse, setAddresse] = useState('');

  const [modalFourniVisible, setModalFourniVisible] = useState(false);
  const [fourni, setFourni] = useState(null);
  
  // Ensure region is always valid
  const safeRegion = {
    latitude: region.latitude || 9.3077,
    longitude: region.longitude || 2.3158,
    latitudeDelta: region.latitudeDelta || 0.0421,
    longitudeDelta: region.longitudeDelta || 0.822,
  };
  const [produit, setProduit] = useState([]);
  const fileUri = FileSystem.documentDirectory + 'product.json';
  //const [selectedTime, setSelectedTime] = useState(new Date());
  //const [showTimePicker, setShowTimePicker] = useState(false);
  const [dataUser, setDataUser] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(true);
  //debbug_lib.debbug_log("dataUser"+ dataUser, "magenta");

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
    "default": TomateImage, 
  };

  const iconMapping = {
  // --- Poissons & Fruits de mer ---
  "mérou": "fish",
  "bar": "fish",
  "carpe grise": "fish",
  "carpe rouge": "fish",
  "sol fibo": "fish",
  "brochet": "fish",
  "crabe de mer": "crab",
  "crabe de rivière": "crab",
  "carpe": "fish",
  "dorade": "fish",
  "silivie": "fish",
  "cilure blanc": "fish",
  "cilure noir": "fish",
  "capitaine": "fish",
  "crevette": "fish",
  "gambas": "fish",
  "langouste": "fish",
  "langoustine": "fish",
  "petite crevette": "fish",
  "calamar": "fish",

  // --- Fruits ---
  "orange": "fruit-citrus",
  "citron": "fruit-citrus",
  "avocat": "fruit-avocado",
  "banane": "fruit-banana",
  "pomme": "food-apple",
  "capoti": "fruit-pineapple", // approximation
  "corossol": "fruit-pineapple", // approximation
  "mangue": "fruit-mango",
  "papaye": "fruit-pineapple", // approximation
  "goyave": "fruit-pineapple", // approximation
  "ananas": "fruit-pineapple",
  "banane plantin": "fruit-banana",
  "banane sucrée": "fruit-banana",
  "litchi": "fruit-grapes", // approximation
  "carambole": "fruit-pineapple", // approximation
  "grenade": "fruit-citrus",

  // --- Légumes & Tubercules ---
  "épinard (gboman)": "leaf",
  "basilic africain (ch io)": "leaf",
  "pomme de terre": "potato",
  "manioc": "cassava", // approximation avec "leaf"
  "ignam": "potato", // approximation
  "riz": "rice",
  "attiéke": "rice",
  "oignon blanc": "onion",
  "tapioka": "rice",
  "oignon rouge": "onion",
  "ail": "garlic",
  "gingembre": "ginger-root",
  "poivre": "pepper-hot",
  "fotete": "leaf",
  "curcuma": "ginger-root",
  "gros piment vert frais": "chili-mild",
  "clou de girofle": "flower",
  "anis étoilé": "flower",
  "gombo": "food-apple-outline", // approximation
  "crincrin": "leaf",
  "telibo (farine)": "sack",
  "farine gari": "sack",
  "riz glacé": "rice",
  "riz parfumé": "rice",
  "riz long": "rice",
  "poivron": "chili-hot",
  "aubergine": "food-apple-outline", // approximation
  "betterave": "beet",
  "navet": "food-apple-outline", // approximation
  "maïs frais": "corn",
  "salade": "leaf",
  "carotte": "carrot",
  "tomate": "food-apple-outline", // approximation

  // --- Volailles & Viandes ---
  "poulet local (bicyclette)": "food-drumstick",
  "canard": "duck",
  "pigeon": "bird",
  "oeuf de caille": "egg",
  "gésier": "food-drumstick",
  "entrecôte": "cow",
  "bavette aloyau": "cow",
  "coeur de boeuf": "cow",
  "viande porc générique": "pig",
  "côte porc première": "pig",
  "côte porc échine": "pig",
  "pied boeuf": "cow",
  "pied porc": "pig",
  "tête boeuf": "cow",
  "tête porc": "pig",
  "langue boeuf": "cow",
  "langue porc": "pig",
  "agouti": "rodent", // approximation
  "poulet cher": "food-drumstick",
  "poulet léger": "food-drumstick",
  "poulet lourd": "food-drumstick",
  "pintade": "bird",
  "lapin": "rabbit",
  "oeuf palette(30)": "egg",
  "caille": "bird",
  "gigot agneau": "sheep",
  "boeuf morceau": "cow",
  "côte de porc": "pig",

  // --- Défaut ---
  "default": "basket"
};


  const [mapInteracting, setMapInteracting] = useState(false);
  const snackBarRef = useRef();

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
        //Alert.alert('Permission refusée', 'Vous devez autoriser la localisation');
        getAlertRef().current?.showAlert(
          "Permission refusée",
          "Vous devez autoriser la localisation",
          true,
          "Autoriser",
          null,
  
        ); 
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

    
  const getFourni = async (id_prod) => {
    let data = {};
    try {
      
      // va chercher la liste des fournisseurs produisant le même 
      // produit afin de les comparer

      const response = await fetch('https://backend-logistique-api-latest.onrender.com/getFournisseurProduction.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id_produit: id_prod})
      });
      data = await response.json();      
      setFourni(data);
      console.log("Fourni fetched:", data);

    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
    }
  };

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
      setProduits(data); // Initialize filtered products
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
    }
  };


  const renderFourniChoix = ({ item: fourni, index }) => {
    const isFirstSupplier = index === 0; 
    const distance = fourni.localisation_orga !== null ? 1 : null; 
    
    return (
    // Removed ScrollView wrapper - this was causing the VirtualizedList warning
      <TouchableOpacity 
        style={[
          styles.productCard,
          isFirstSupplier && styles.cheapestCard
        ]}
        onPress={() => navigation.navigate('FicheFournisseur', {fourni})}
      >
        {/* Best Price Badge for first supplier */}
        {isFirstSupplier && (
          <View style={styles.bestPriceBadge}>
            <Text style={styles.bestPriceText}>MEILLEUR PRIX</Text>
          </View>
        )}
        
        <View style={styles.supplierHeader}>
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName}>{fourni.nom_orga}</Text>
            <Text style={styles.productPrice}>{fourni.prix_produit} FCFA</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate("Formulaire")}
          >
            
            <MaterialCommunityIcons
                name="cart"
                size={20}
                color="#FFF"              
              />
          </TouchableOpacity>
        </View>
        
        <View style={styles.supplierDetails}>
          <View style={styles.detailRow}>
            
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#64748B"              
              />

            <Text style={styles.detailText}>
              {distance !== null
                ? `${distance.toFixed(1)} km`
                : fourni.ville_organisation || 'Adresse non renseignée'
              }
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            
            <MaterialCommunityIcons
                name="cube-outline"
                size={16}
                color="#64748B"              
              />
            <Text style={styles.detailText}>
              Stock: {fourni.nb_produit_fourni} unités
            </Text> 
          </View>
        </View>
      </TouchableOpacity>
    );
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
        item.nom_produit && 
        typeof item.nom_produit === 'string' && 
        item.nom_produit.toLowerCase().includes(text.toLowerCase()) || 
        item.nom_categorie.toLowerCase().includes(text.toLowerCase()) 
      );
      setProduits(filtered);
    }
  };

  // Get unit label based on type_vendu
  const getUnitLabel = (product) => {
    if (product && product.type_vendu) {
      if (product.type_vendu === 'poids') {
        return 'kg';
      } else if (product.type_vendu === 'pièce') {
        return 'unité(s)';
      }
    }
    return 'unité(s)'; // default
  };

  // Get quantity label for modal
  const getQuantityLabel = (product) => {
    if (product && product.type_vendu) {
      if (product.type_vendu === 'poids') {
        return 'Quantité (en kg):';
      } else if (product.type_vendu === 'pièce') {
        return 'Quantité (nombre de pièces):';
      }
    }
    return 'Quantité (nombre de pièces):'; // default
  };

  // Fixed date formatting function
  const formatDate = (dateValue) => {
    const date = dayjs(dateValue);
    return date.format('YYYY-MM-DD HH:mm:ss');
  };

  // Fixed date normalization function
  const normaliseDate = (dateValue) => {
    const date = dayjs(dateValue);
    return date.format('DD/MM/YYYY HH:mm');
  };

  const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
      /*
      getAlertRef().current?.showAlert(
        "Permission refusée",
        "Vous devez autoriser la localisation",
        true,
        "Autoriser",
        null,

      ); */
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
    const initializeData = async () => {
      console.log("1");
      try {
        setUserDataLoading(true);
        // Read user data asynchronously
        const userData = await fileManager.read_file("auto.json");
        setDataUser(userData);
        debbug_lib.debbug_log("User data loaded: " + JSON.stringify(userData), "green");
      } catch (error) {
        console.error("Error loading user data:", error);
        setDataUser(null);
      } finally {
        setUserDataLoading(false);
      }
    };

    const initializeApp = async () => {
      try {
        await initializeData();
        await requestLocationPermission();
        await getProduct();
        
        debbug_lib.debbug_log("pre_selected_item: " + pre_selected_item, "yellow");  
        if (pre_selected_item != null && pre_selected_item !== undefined) {
          set_product_rec();
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };

    initializeApp();
    
  }, []);

  const handleMapPress = (e) => {
    try {
      const { coordinate } = e.nativeEvent;
      if (coordinate && coordinate.latitude && coordinate.longitude) {
        setSelectedLocation(coordinate);
      }
    } catch (error) {
      console.error('Error handling map press:', error);
    }
  };


  const getIconName = (productName) => {
  if (!productName) return iconMapping.default;
  const name = productName.toLowerCase();
  
  // Cherche correspondance exacte ou partielle
  for (let key in iconMapping) {
    if (name.includes(key)) {
      return iconMapping[key];
    }
  }
  
  return iconMapping.default;
};



  // Modified product list rendering to limit to 10 items and show unit
const renderProductItem = ({ item }) => {
  const productName = item.nom_produit || 'Produit sans nom';
  const unitLabel = getUnitLabel(item);
  const iconName = getIconName(productName);

  return (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => {
        setSelectedProduct({
          id: item.id_produit,
          key: productName,
          originalItem: item
        });
        setModalVisible(true);
      }}
    >
      <View style={styles.productItemContent}>
        <MaterialCommunityIcons
          name={iconName}
          size={28}
          color="#4CAF50"
          style={{ marginRight: 8 }}
        />
        <View style={styles.productTextContainer}>
          <Text style={styles.productName}>{productName}</Text>
          <Text style={styles.productUnit}>Vendu par {unitLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

  const set_product_rec = () => {
    debbug_lib.debbug_log("produit deja selec à partir d'un panier", "yellow");
    
    // Check if pre_selected_item is an array
    if (pre_selected_item && Array.isArray(pre_selected_item)) {
      // Collect all new products first
      const newProducts = [];
      
      for(let i = 0; i < pre_selected_item.length; i++){
        const item = pre_selected_item[i];
        if (!item) continue; // Skip if item is null/undefined
        
        debbug_lib.debbug_log(item, "blue");
        
        const newProduct = {
          id: item.id || item.id_produit || Math.random().toString(),
          name: item.nom || item.nom_produit || 'Produit',
          productDetails: {
            ...item,
            nombre: item.quantite || item.nombre || 1,
            poids: item.quantite || item.poids || 1
          }
        };
        
        newProducts.push(newProduct);
      }
      
      // Set all products at once
      setProducts(prevProducts => [...prevProducts, ...newProducts]);
    }
  }

  const add_product = (name, quantite, id, originalItem = null, shouldBatch = false) => {
    if (!shouldBatch) {
      setModalVisible(false);
    }

    const newProduct = {
      id,
      name,
      productDetails: {
        ...(originalItem || {}),
        quantite: quantite,
        type_vendu: originalItem?.type_vendu || 'pièce'
      }
    };
    
    if (shouldBatch) {
      // Return the product instead of setting state immediately
      return newProduct;
    } else {
      setProducts(prevProducts => [...prevProducts, newProduct]);
      setNombre('');
      // Show snackbar
      snackBarRef.current?.show('Produit ajouté à la commande', 'info');
    }
  };

  const set_product_rec_alternative = () => {
    debbug_lib.debbug_log("produit deja selec à partir d'un panier", "yellow");
    
    if (pre_selected_item && Array.isArray(pre_selected_item)) {
      const newProducts = [];
      
      for(let i = 0; i < pre_selected_item.length; i++){
        const item = pre_selected_item[i];
        if (!item) continue; // Skip if item is null/undefined
        
        debbug_lib.debbug_log(item, "blue");
        
        const product = add_product(
          item.nom || item.nom_produit || 'Produit',
          item.quantite || 1,
          item.id || item.id_produit || Math.random().toString(),
          item,
          true // shouldBatch = true
        );
        
        newProducts.push(product);
      }
      
      // Set all products at once
      setProducts(prevProducts => [...prevProducts, ...newProducts]);
    }
  }

  // New function to remove product
  const removeProduct = (productId) => {


    getAlertRef().current?.showAlert(
      "Supprimer le produit",
      "Voulez-vous vraiment supprimer ce produit de votre commande?",
      true,
      "Annuler",
      null,
      true,
      "Supprimer",
      () => {
        setProducts(products.filter(product => product.id !== productId));
        // Show snackbar
        snackBarRef.current?.show('Produit supprimé de la commande', 'info');
      },
    ); 

    
  };


  // Fixed date picker handlers
  const openDatePicker = () => {
    setPickerMode('date');
    setShowPicker(true);
  };

  const onPickerChange = (event, selectedValue) => {
    if (pickerMode === 'date') {
      setShowPicker(false);
      if (selectedValue) {
        // Set date, then open time picker
        const newDate = new Date(selectedValue);
        setDate(prev => {
          // Keep previous time if any
          const prevDate = prev || new Date();
          newDate.setHours(prevDate.getHours());
          newDate.setMinutes(prevDate.getMinutes());
          return newDate;
        });
        setPickerMode('time');
        setTimeout(() => setShowPicker(true), 300); // Open time picker after a short delay
      }
    } else if (pickerMode === 'time') {
      setShowPicker(false);
      if (selectedValue) {
        setDate(prev => {
          const newDate = new Date(prev);
          newDate.setHours(selectedValue.getHours());
          newDate.setMinutes(selectedValue.getMinutes());
          return newDate;
        });
      }
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
    getAlertRef().current?.showAlert(
      "Validation de la commande",
      "Voulez vous vraiment valider cette commande?",
      true,
      "Valider",
      () => handleSubmit(),
      true,
      "Annuler",
      () => console.log('Annulation'),

    ); 
  }

  const testServerConnection = async () => {
    try {
      // Create a timeout promise for the connection test
      const testTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection test timeout')), 10000); // 10 second timeout
      });

      const response = await Promise.race([
        fetch('https://backend-logistique-api-latest.onrender.com/check_conn.php'),
        testTimeoutPromise
      ]);
      
      const responseText = await response.text();
      console.log('Test server response:', responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log('Server test successful:', data);
        return data.success ? true : false;
      } catch (parseError) {
        console.error('Server test JSON parse error:', parseError);
        console.error('Server test response was:', responseText);
        return false;
      }
    } catch (error) {
      console.error('Server test failed:', error);
      return false;
    }
  };

  const handleSubmit = () => {
    console.log("La commande a été soumise");
    setChargement(true);
    
    // Test server connection first, but don't block if it fails
    testServerConnection().then(isConnected => {
      if (!isConnected) {
        console.warn('Server connection test failed, but continuing with form submission...');
        // Don't block the form submission, just log the warning
      }
      
      // Continue with form submission regardless
      submitForm();
    }).catch(error => {
      console.warn('Server connection test error:', error);
      // Continue with form submission even if test fails
      submitForm();
    });
  };

  const submitForm = () => {
    // Validation checks
    if (userDataLoading) {
      Alert.alert('Erreur', 'Veuillez attendre le chargement des données utilisateur');
      setChargement(false);
      return;
    }

    if (!selectedLocation) {
      Alert.alert('Erreur', 'Veuillez sélectionner un lieu de livraison sur la carte');
      setChargement(false);
      return;
    }

    if (!commandeName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour la commande');
      setChargement(false);
      return;
    }

    if (products.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins un produit à votre commande');
      setChargement(false);
      return;
    }

    // Check if dataUser exists and has an id
    if (!dataUser || !dataUser.id) {
      Alert.alert('Erreur', 'Erreur de connexion utilisateur. Veuillez vous reconnecter.');
      setChargement(false);
      try {
        if (navigation && navigation.navigate) {
          navigation.navigate('HomePage');
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
      return;
    }

    // Validate and prepare form data
    const formData = {
      nom_dmd: commandeName.trim(),
      desc_dmd: description.trim(),
      date_fin: formatDate(date), // Using the fixed formatDate function
      id_client: parseInt(dataUser.id) || 1, // Ensure it's an integer
      localisation_dmd: addresse !== '' ? addresse : `${selectedLocation.latitude};${selectedLocation.longitude}`,
      produit_contenu: products.map(product => ({
        id_produit: parseInt(product.id) || 1, // Ensure it's an integer
        nb_produit: parseFloat(product.productDetails.quantite) || 1,
        //ids_piece_produit: parseFloat(product.productDetails.poids) || 0
      }))
    };

    // Additional validation
    if (!formData.nom_dmd) {
      Alert.alert('Erreur', 'Le nom de la commande ne peut pas être vide');
      setChargement(false);
      return;
    }

    if (formData.produit_contenu.length === 0) {
      Alert.alert('Erreur', 'Aucun produit sélectionné');
      setChargement(false);
      return;
    }

    console.log('Form data to send:', JSON.stringify(formData, null, 2));
    console.log('Sending request to:', 'https://backend-logistique-api-latest.onrender.com/create_command.php');
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
    });

    // Race between the fetch and timeout
    Promise.race([
      fetch('https://backend-logistique-api-latest.onrender.com/create_command.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      }),
      timeoutPromise
    ])
    .then(async response => { 
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response:', errorText);
        throw new Error(`Erreur réseau: ${response.status} - ${errorText.substring(0, 200)}`);
      }
      
      // Get the response text first to debug
      const responseText = await response.text();
      console.log('Server response:', responseText);
      
      // Try to parse as JSON
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response was:', responseText);
        throw new Error(`Erreur de réponse serveur: ${responseText.substring(0, 100)}...`);
      }
    })
    .then(data => {      
      console.log('Succès commande:', data);
      
      // Call assign.php and wait for it to complete
      console.log('Calling assign.php...');
      
      // Create a timeout promise for assign.php
      const assignTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Assign request timeout')), 15000); // 15 second timeout
      });

      return Promise.race([
        fetch('https://backend-logistique-api-latest.onrender.com/assign.php', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }),
        assignTimeoutPromise
      ]);
    })
    .then(async response => {
      console.log('Assign response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Erreur lors de l\'assignation des commandes:', response.status, errorText);
        return null;
      } else {
        const responseText = await response.text();
        console.log('Split assign response:', responseText);
        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error('Split assign JSON Parse Error:', parseError);
          console.error('Split assign response was:', responseText);
          return null;
        }
      }
    })
    .then(splitData => {
      console.log('Split assign result:', splitData);
      getAlertRef().current?.showAlert(
        "Succès",
        "Commande créée avec succès! La Préparation est en cours.",
      ); 
      
      // Reset form
      setCommandeName('');
      setDescription('');
      setDate(dayjs());
      setProducts([]);
      setChildViews([]);
      setSelectedLocation(null);
      setChargement(false);
      navigation.navigate('Accueil');
    })
    .catch(error => {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la commande: ' + error.message);
      setChargement(false);
    });
  };
  
  return(
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{flex: 1, position: 'relative'}}>
        <ScrollView contentContainerStyle={styles.scrollContainer} scrollEnabled={!mapInteracting}>
          <View style={styles.container}>
            <Text style={styles.textH1}>Nouvelle Commande</Text>
            
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nom de la commande</Text>
                <TextInput
                  style={[styles.input, isNameFocused && styles.inputFocused]}
                  placeholder="Ex: Commande viande restaurant"
                  placeholderTextColor="#a2a2a9"
                  value={commandeName}
                  onChangeText={setCommandeName}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                />
              </View>

              {/* Description Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description (Optionnel)</Text>
                <TextInput
                  style={[styles.inputDesc, isDescFocused && styles.inputFocused]}
                  placeholder="Ex: Viande et poisson pour l'Hotel n°..."
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
                  onPress={openDatePicker}
                >
                  <Text style={styles.datePickerButtonText}>
                    {dayjs(date).format('DD/MM/YYYY HH:mm')}
                  </Text>
                  <Image 
                    source={require('../assets/Icons/calendar-icon.png')} 
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
                {showPicker && (
                  <DateTimePicker
                    value={date}
                    mode={pickerMode}
                    is24Hour={true}
                    display="default"
                    onChange={onPickerChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              {/* Fournisseur Modal */}
                <Modal
                  animationType='fade'
                  transparent={true}
                  visible={modalFourniVisible}
                  onRequestClose={() => setModalFourniVisible(false)}
                >

                  <FlatList
                    data={fourni}
                    renderItem={renderFourniChoix}
                    keyExtractor={(fourni) => fourni.id_fournisseur.toString()}
                    numColumns={1}
                    contentContainerStyle={styles.productGrid}
                    showsVerticalScrollIndicator={false}
                  />
                </Modal>



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

                    {/*
                  <Text style={styles.modalText}>
                    Poids par pièce (en grammes):
                  </Text>
                  <TextInput
                    style={[styles.inputNB, { marginBottom: 20 }]}
                    placeholder="Ex: 150"
                    keyboardType="numeric"
                    value={poids}
                    onChangeText={setPoids}
                  />*/}

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
                          
                          
                          if (nombre ) {
                            add_product(
                              selectedProduct.key,
                              //poids,
                              1,
                              nombre,
                              selectedProduct.id,
                              selectedProduct.originalItem
                            ); // CHECKER LE NB DE PARAM
                            getFourni(selectedProduct.id);
                            setModalFourniVisible(true)
   

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
                  placeholder="Rechercher un produit ou une catégorie"
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
            <SafeAreaView style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Produits commandable</Text>
              <View style={styles.productListContainer}>
                <FlatList
                  data={produits}
                  keyExtractor={(item, index) => item.id_produit?.toString() || index.toString()}
                  renderItem={renderProductItem}
                  ListEmptyComponent={
                    <Text style={styles.emptyListText}>Aucun produit trouvé</Text>
                  }
                  showsVerticalScrollIndicator={true}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  style={styles.productFlatList}
                />
              </View>
            </SafeAreaView>

              {/* Selected Products - Enhanced with delete functionality */}
              {products.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Produits Sélectionnés</Text>
                  <View style={styles.selectedProductsContainer}>
                  {products.map((product, index) => (
                    <View key={`${product.name}-${index}`} style={styles.containerProduct}>
                      <View style={styles.productInfo}>
                        <Text style={styles.productInfoText}>
                          {product.productDetails.nombre}x {product.name} - {/*{product.productDetails.poids}g/pièce*/}
                        </Text>
                        <Text style={styles.categoryText}>
                          ({product.productDetails.nom_categorie || 'Catégorie non définie'})
                        </Text>
                      </View>
                      <View style={styles.productActions}>
                        <Image
                          style={{marginRight: 25}}
                          source={dic_image_name[typeof product.name === 'string' ? product.name.toLowerCase() : 'tomate']}
                        />
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => removeProduct(product.id)}
                        >
                          <Text style={{fontSize: 20, color: '#000'}}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Modal Fournisseur liste 

              <Modal              
                  animationType='fade'
                  transparent={true}
                  visible={modalFourniVisible}
                  onRequestClose={() => setModalFourniVisible(false)}>

                <SafeAreaView style={styles.listFourni}>
                  <Text style={styles.NbFourni}>Nombre de fournisseur produisant {item.nom_produit}: {item.nb_fournisseur}</Text>
                  {estCharge ? 
                    (<FlatList
                      data={fourni}
                      renderItem={renderFourniChoix}
                      keyExtractor={(fourni) => fourni.id_fournisseur.toString()}
                      numColumns={1}
                      contentContainerStyle={styles.productGrid}
                      showsVerticalScrollIndicator={false}
                    />) : (
                      <View style={styles.loadingContainer}>
                        <View style={styles.loadingSpinner}>
                          <Text style={styles.loadingEmoji}>⏳</Text>
                        </View>
                        <Text style={styles.loadingText}>Chargement des Fournisseurs...</Text>
                      </View>
                    )        
                  
                  }
          
                </SafeAreaView >
              </Modal>*/}

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
                  <LeafletMap
                    latitude={selectedLocation?.latitude || region.latitude}
                    longitude={selectedLocation?.longitude || region.longitude}
                    selectable={true}
                    onLocationChange={(coords) => setSelectedLocation(coords)}
                    onMapTouchStart={() => setMapInteracting(true)}
                    onMapTouchEnd={() => setMapInteracting(false)}
                  />
                  {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
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
                <View style={styles.orDivider}>
                    <View style={styles.dividerLine}></View>
                    <Text style={styles.orText}>OU</Text>
                    <View style={styles.dividerLine}></View>
                  </View>
                  <Text style={[styles.tapInstruction, {marginBottom: 10}]}>
                    Entrez votre addresse manuellement
                  </Text>
                  <TextInput
                    style={[styles.inputDesc, isDescFocused && styles.inputFocused, {height: 60}]}
                    placeholder="ex: 98JM+HPR, Cotonou, Bénin"
                    placeholderTextColor="#a2a2a9"                
                    numberOfLines={1}
                    maxLength={200}
                    value={addresse}
                    onChangeText={setAddresse}
                    onFocus={() => setIsDescFocused(true)}
                    onBlur={() => setIsDescFocused(false)}
                  />
              </View>
            
              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, (chargement || userDataLoading) && styles.submitButtonDisabled]}
                onPress={handleConfirmationCommand}
                disabled={chargement || userDataLoading}
              >
                <Text style={styles.submitButtonText}>
                  {userDataLoading ? "Chargement..." : chargement ? "Envoi en cours..." : "Valider la commande"}
                </Text>
                {(chargement || userDataLoading) && (
                  <ActivityIndicator color="#fff" style={styles.loadingIndicator} />
                )}
              </TouchableOpacity>

              {/* Test Server Button - For debugging */}
              {/*<TouchableOpacity
                style={[styles.testButton]}
                onPress={async () => {
                  const isConnected = await testServerConnection();
                  Alert.alert(
                    'Test Serveur', 
                    isConnected ? 'Serveur accessible' : 'Erreur de connexion au serveur'
                  );
                }}
              > 
                <Text style={styles.testButtonText}>Tester la connexion serveur</Text>
              </TouchableOpacity>*/}
            </View>
          </View>
        </ScrollView>
        <Snackbar ref={snackBarRef} />
      </View>
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
  timePickerModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  datePicker: {
    width: '100%',
    marginVertical: 20,
  },
  timePicker: {
    width: '100%',
    marginVertical: 15,
  },
  timePickerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  timeDisplayContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timeDisplayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3192',
  },
  emptyListText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 40,
    fontSize: 14,
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
    // Remove the fixed height: 600 that was limiting the container
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
    fontWeight: '500',
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
  
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  productItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    backgroundColor: '#fff',
    marginVertical: 1,
    marginHorizontal: 5,
    borderRadius: 6,
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
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  imageSearch: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  testButton: {
    backgroundColor: '#2E3192',
    padding: 16,
    borderRadius: 8,
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E3192',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateDisplayContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dateDisplayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3192',
  },
    productListContainer: {
    height: 250, // Fixed height for the scrollable area
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  
  productFlatList: {
    flex: 1,
    paddingHorizontal: 5,
  },
   productTextContainer: {
    flex: 1,
  },
    productUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  
  cheapestCard: {
    borderColor: '#2E7D32',
    borderWidth: 2,
    backgroundColor: '#F8FFF8',
  },
  
  bestPriceBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  
  bestPriceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  supplierInfo: {
    flex: 1,
    marginRight: 12,
  },
  
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  
  cartButton: {
    marginTop: 10,
    backgroundColor: '#FF8C00', // Orange background
    width: 44,
    height: 44,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF8C00',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  
  supplierDetails: {
    gap: 8,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  detailText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  
  productGrid: {
    paddingBottom: 20,
  },

});

export default Formulaire;  