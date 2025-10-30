import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import dayjs from "dayjs";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import TomateImage from "../assets/Icons/Dark-tomato.png";
import SaladeImage from "../assets/Icons/Dark-Salad.png";
import CarotteImage from "../assets/Icons/Dark-Carrot.png";
import ChickenImage from "../assets/Icons/Dark-Chicken.png";
import LapinImage from "../assets/Icons/Rabbit.png";
import OeufImage from "../assets/Icons/Dark-oeuf.png";
import BoeufImage from "../assets/Icons/Dark-beef.png";

import LeafletMap from "../components/LeafletMap";
import { getAlertRef } from "./util/AlertService";
import Snackbar from "./util/SnackBar.js";
import * as debbug_lib from "./util/debbug.js";
import * as fileManager from "./util/file-manager.js";

// Static data outside component to prevent recreation
const DIC_IMAGE_NAME = {
  tomate: TomateImage,
  salade: SaladeImage,
  carotte: CarotteImage,
  "poulet léger": ChickenImage,
  "poulet lourd": ChickenImage,
  pintade: ChickenImage,
  lapin: LapinImage,
  "oeuf palette(20)": OeufImage,
  caille: ChickenImage,
  "gigot agneau": BoeufImage,
  "cote de porc": BoeufImage,
  "boeuf morceau": BoeufImage,
  default: TomateImage,
};

const ICON_MAPPING = {
  mérou: "fish",
  bar: "fish",
  "carpe grise": "fish",
  "carpe rouge": "fish",
  "sol fibo": "fish",
  brochet: "fish",
  "crabe de mer": "crab",
  "crabe de rivière": "crab",
  carpe: "fish",
  dorade: "fish",
  silivie: "fish",
  "cilure blanc": "fish",
  "cilure noir": "fish",
  capitaine: "fish",
  crevette: "fish",
  gambas: "fish",
  langouste: "fish",
  langoustine: "fish",
  "petite crevette": "fish",
  calamar: "fish",
  orange: "fruit-citrus",
  citron: "fruit-citrus",
  avocat: "fruit-avocado",
  banane: "fruit-banana",
  pomme: "food-apple",
  capoti: "fruit-pineapple",
  corossol: "fruit-pineapple",
  mangue: "fruit-mango",
  papaye: "fruit-pineapple",
  goyave: "fruit-pineapple",
  ananas: "fruit-pineapple",
  "banane plantin": "fruit-banana",
  "banane sucrée": "fruit-banana",
  litchi: "fruit-grapes",
  carambole: "fruit-pineapple",
  grenade: "fruit-citrus",
  "épinard (gboman)": "leaf",
  "basilic africain (ch io)": "leaf",
  "pomme de terre": "potato",
  manioc: "cassava",
  ignam: "potato",
  riz: "rice",
  attiéke: "rice",
  "oignon blanc": "onion",
  tapioka: "rice",
  "oignon rouge": "onion",
  ail: "garlic",
  gingembre: "ginger-root",
  poivre: "pepper-hot",
  fotete: "leaf",
  curcuma: "ginger-root",
  "gros piment vert frais": "chili-mild",
  "clou de girofle": "flower",
  "anis étoilé": "flower",
  gombo: "food-apple-outline",
  crincrin: "leaf",
  "telibo (farine)": "sack",
  "farine gari": "sack",
  "riz glacé": "rice",
  "riz parfumé": "rice",
  "riz long": "rice",
  poivron: "chili-hot",
  aubergine: "food-apple-outline",
  betterave: "beet",
  navet: "food-apple-outline",
  "maïs frais": "corn",
  salade: "leaf",
  carotte: "carrot",
  tomate: "food-apple-outline",
  "poulet local (bicyclette)": "food-drumstick",
  canard: "duck",
  pigeon: "bird",
  "oeuf de caille": "egg",
  gésier: "food-drumstick",
  entrecôte: "cow",
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
  agouti: "rodent",
  "poulet cher": "food-drumstick",
  "poulet léger": "food-drumstick",
  "poulet lourd": "food-drumstick",
  pintade: "bird",
  lapin: "rabbit",
  "oeuf palette(30)": "egg",
  caille: "bird",
  "gigot agneau": "sheep",
  "boeuf morceau": "cow",
  "côte de porc": "pig",
  default: "basket",
};

// Utility function
const getIconName = (productName) => {
  if (!productName) return ICON_MAPPING.default;
  const name = productName.toLowerCase();
  for (let key in ICON_MAPPING) {
    if (name.includes(key)) {
      return ICON_MAPPING[key];
    }
  }
  return ICON_MAPPING.default;
};

// Memoized Product Item Componentm
const ProductItem = memo(({ item, onPress }) => {
  const productName = item.nom_produit || "Produit sans nom";
  const unitLabel = item.type_vendu === "poids" ? "kg" : "unité(s)";
  const iconName = useMemo(() => getIconName(productName), [productName]);

  return (
    <TouchableOpacity
      style={styles.productItem}
      onPress={onPress}
      activeOpacity={0.7}
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
});

// Memoized Selected Product Item
const SelectedProductItem = memo(({ product, index, onRemove }) => {
  const quantity = parseFloat(product.productDetails.quantite) || 1;
  const price = parseFloat(product.productDetails.prix) || 0;
  const lineTotal = quantity * price;
  const productNameLower = typeof product.name === "string" ? product.name.toLowerCase() : "default";

  return (
    <View style={styles.containerProduct}>
      <View style={styles.productInfo}>
        <Text style={styles.productInfoText}>
          {quantity}x {product.name}
        </Text>
        <Text style={styles.productPriceText}>
          {price.toLocaleString()} FCFA x {quantity} = {lineTotal.toLocaleString()} FCFA
        </Text>
        <Text style={styles.categoryText}>
          ({product.productDetails.nom_categorie || "Catégorie non définie"})
        </Text>
      </View>
      <View style={styles.productActions}>
        <Image
          style={{ marginRight: 25, width: 40, height: 40 }}
          source={DIC_IMAGE_NAME[productNameLower] || DIC_IMAGE_NAME.default}
        />
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onRemove}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20, color: "#000" }}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Memoized Supplier Card
const SupplierCard = memo(({ item, index, onSelect }) => {
  const isFirstSupplier = index === 0;
  const distance = item.localisation_orga !== null ? 1 : null;

  return (
    <TouchableOpacity
      style={[styles.productCard, isFirstSupplier && styles.cheapestCard]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {isFirstSupplier && (
        <View style={styles.bestPriceBadge}>
          <Text style={styles.bestPriceText}>MEILLEUR PRIX</Text>
        </View>
      )}

      <View style={styles.supplierHeader}>
        <View style={styles.supplierInfo}>
          <Text style={styles.supplierName}>{item.nom_orga}</Text>
          <Text style={styles.productPrice}>{item.prix_produit} FCFA</Text>
        </View>
      </View>

      <View style={styles.supplierDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#64748B" />
          <Text style={styles.detailText}>
            {distance !== null
              ? `${distance.toFixed(1)} km`
              : item.ville_organisation || "Adresse non renseignée"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="cube-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>
            Stock: {item.nb_produit_fourni} unités
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const Formulaire = ({ navigation, route }) => {
  // Pre-selected items from route
  const preSelectedItem = route?.params?.produits || null;

  // Form state
  const [commandeName, setCommandeName] = useState("");
  const [description, setDescription] = useState("");
  const [nombre, setNombre] = useState("");
  const [addresse, setAddresse] = useState("");

  // Date state
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalFourniVisible, setModalFourniVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Product state
  const [products, setProducts] = useState([]);
  const [produit, setProduit] = useState([]);
  const [fourni, setFourni] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Location state
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [region, setRegion] = useState({
    latitude: 9.3077,
    longitude: 2.3158,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.822,
  });

  // UI state
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [mapInteracting, setMapInteracting] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // Data state
  const [dataUser, setDataUser] = useState(null);

  // Refs
  const snackBarRef = useRef();
  const fournisseurListeRef = useRef([]);

  // Memoized filtered products
  const filteredProduits = useMemo(() => {
    if (searchText.trim() === "") {
      return produit;
    }
    const lowerSearch = searchText.toLowerCase();
    return produit.filter(
      (item) =>
        (item.nom_produit &&
          typeof item.nom_produit === "string" &&
          item.nom_produit.toLowerCase().includes(lowerSearch)) ||
        (item.nom_categorie && item.nom_categorie.toLowerCase().includes(lowerSearch))
    );
  }, [searchText, produit]);

  // Memoized total calculation
  const totalAmount = useMemo(() => {
    return products.reduce((sum, product) => {
      const quantity = parseFloat(product.productDetails.quantite) || 1;
      const price = parseFloat(product.productDetails.prix) || 0;
      return sum + quantity * price;
    }, 0);
  }, [products]);

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        setHasLocationPermission(true);
        getCurrentLocation();
        return true;
      } else {
        setHasLocationPermission(false);
        getAlertRef().current?.showAlert(
          "Permission refusée",
          "Vous devez autoriser la localisation",
          true,
          "Autoriser",
          null
        );
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!hasLocationPermission) {
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
      setRegion((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not get your current location");
    }
  }, [hasLocationPermission]);

  // Get suppliers for a product
  const getFourni = useCallback(async (id_prod) => {
    try {
      const response = await fetch(
        "https://backend-logistique-api-latest.onrender.com/get_fournisseur_produit.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_produit: id_prod }),
        }
      );
      const data = await response.json();
      setFourni(data);
      console.log("Fourni fetched:", data);
      return data.length === 0 ? 1 : 0;
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      return 1;
    }
  }, []);

  // Get products
  const getProduct = useCallback(async () => {
    try {
      const fileData = await fileManager.read_file("product.json");
      let data = {};

      if (fileData && Object.keys(fileData).length > 0) {
        console.log("Lecture depuis le fichier local");
        data = fileData;
      } else {
        console.log("Fichier vide ou inexistant, récupération depuis le serveur");
        const response = await fetch(
          "https://backend-logistique-api-latest.onrender.com/product.php"
        );
        data = await response.json();
        console.log("Produits reçus du serveur:", data);
      }
      setProduit(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
    }
  }, []);

  // Add product to cart
  const add_product = useCallback((name, quantite, id, originalItem = null, price = null) => {
    setModalVisible(false);

    const productPrice = price || originalItem?.prix_produit || 0;
    const newProduct = {
      id,
      name,
      productDetails: {
        ...(originalItem || {}),
        quantite: parseFloat(quantite) || 1,
        prix: productPrice,
        type_vendu: originalItem?.type_vendu || "pièce",
      },
    };

    setProducts((prev) => [...prev, newProduct]);
    setNombre("");
    snackBarRef.current?.show("Produit ajouté à la commande", "info");
  }, []);

  // Remove product from cart
  const removeProduct = useCallback((productId) => {
    getAlertRef().current?.showAlert(
      "Supprimer le produit",
      "Voulez-vous vraiment supprimer ce produit de votre commande?",
      true,
      "Annuler",
      null,
      true,
      "Supprimer",
      () => {
        setProducts((prev) => prev.filter((product) => product.id !== productId));
        snackBarRef.current?.show("Produit supprimé de la commande", "info");
      }
    );
  }, []);

  // Handle product selection
  const handleProductPress = useCallback((item) => {
    setSelectedProduct({
      id: item.id_produit,
      key: item.nom_produit || "Produit sans nom",
      originalItem: item,
    });
    setModalVisible(true);
  }, []);

  // Handle supplier selection
  const handleSupplierSelect = useCallback((supplierItem) => {
    fournisseurListeRef.current.push(supplierItem.id_fournisseur);
    setModalFourniVisible(false);

    if (selectedProduct) {
      if(fournisseurListeRef.current.length == 2){
        getAlertRef().current?.showAlert(
          "Multiple Fournisseur",
          "Cette commande contient des multples fournisseurs elle va donc être divisé en mutiple commande",
          true,
          "OK",
          () => null
        );
      }
      add_product(
        selectedProduct.key,
        nombre,
        selectedProduct.id,
        selectedProduct.originalItem,
        supplierItem.prix_produit
      );
    }
  }, [selectedProduct, nombre, add_product]);

  // Handle express delivery
  const handleExpressDelivery = useCallback(() => {
    setModalFourniVisible(false);
    if (selectedProduct && fourni && fourni.length > 0) {
      add_product(
        selectedProduct.key,
        nombre,
        selectedProduct.id,
        selectedProduct.originalItem,
        fourni[0].prix_produit
      );
    }
  }, [selectedProduct, nombre, fourni, add_product]);

  // Handle product confirmation
  const handleProductConfirm = useCallback(async () => {
    if (nombre) {
      const result = await getFourni(selectedProduct.id);
      if (result === 1) {
        setModalVisible(false);
        getAlertRef().current?.showAlert(
          "Aïe",
          "Oups! Aucun fournisseur ne peut remplir votre commande. Revenez plus tard",
          true,
          "continuer",
          null
        );
      } else {
        setModalVisible(false);
        setModalFourniVisible(true);
      }
    } else {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
    }
  }, [nombre, selectedProduct, getFourni]);

  // Date picker handlers
  const openDatePicker = useCallback(() => {
    setPickerMode("date");
    setShowPicker(true);
  }, []);

  const onPickerChange = useCallback((event, selectedValue) => {
    if (pickerMode === "date") {
      setShowPicker(false);
      if (selectedValue) {
        const newDate = new Date(selectedValue);
        setDate((prev) => {
          const prevDate = prev || new Date();
          newDate.setHours(prevDate.getHours());
          newDate.setMinutes(prevDate.getMinutes());
          return newDate;
        });
        setPickerMode("time");
        setTimeout(() => setShowPicker(true), 300);
      }
    } else if (pickerMode === "time") {
      setShowPicker(false);
      if (selectedValue) {
        setDate((prev) => {
          const newDate = new Date(prev);
          newDate.setHours(selectedValue.getHours());
          newDate.setMinutes(selectedValue.getMinutes());
          return newDate;
        });
      }
    }
  }, [pickerMode]);

  // Format date
  const formatDate = useCallback((dateValue) => {
    return dayjs(dateValue).format("YYYY-MM-DD HH:mm:ss");
  }, []);

  // Test server connection
  const testServerConnection = useCallback(async () => {
    try {
      const testTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection test timeout")), 10000);
      });

      const response = await Promise.race([
        fetch("https://backend-logistique-api-latest.onrender.com/check_conn.php"),
        testTimeoutPromise,
      ]);

      const responseText = await response.text();
      console.log("Test server response:", responseText);

      try {
        const data = JSON.parse(responseText);
        console.log("Server test successful:", data);
        return data.success ? true : false;
      } catch (parseError) {
        console.error("Server test JSON parse error:", parseError);
        return false;
      }
    } catch (error) {
      console.error("Server test failed:", error);
      return false;
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    console.log("La commande a été soumise");
    setChargement(true);

    testServerConnection()
      .then((isConnected) => {
        if (!isConnected) {
          console.warn("Server connection test failed, but continuing with form submission...");
        }
        submitForm();
      })
      .catch((error) => {
        console.warn("Server connection test error:", error);
        submitForm();
      });
  }, [testServerConnection]);

  // Submit form
  const submitForm = useCallback(() => {
    if (userDataLoading) {
      Alert.alert("Erreur", "Veuillez attendre le chargement des données utilisateur");
      setChargement(false);
      return;
    }

    if (!selectedLocation) {
      Alert.alert("Erreur", "Veuillez sélectionner un lieu de livraison sur la carte");
      setChargement(false);
      return;
    }

    if (!commandeName.trim()) {
      Alert.alert("Erreur", "Veuillez saisir un nom pour la commande");
      setChargement(false);
      return;
    }

    if (products.length === 0) {
      Alert.alert("Erreur", "Veuillez ajouter au moins un produit à votre commande");
      setChargement(false);
      return;
    }

    if (!dataUser) {
      Alert.alert("Erreur", "Erreur de connexion utilisateur. Veuillez vous reconnecter.");
      setChargement(false);
      if (navigation?.navigate) {
        navigation.navigate("HomePage");
      }
      return;
    }

    const formData = {
      //A checker renvoie 1, alors que c'est faux
      nom_dmd: commandeName.trim(),
      desc_dmd: description.trim(),
      date_fin: formatDate(new Date()),
      id_client: dataUser.session_id || 1,
      localisation_dmd:
        addresse !== ""
          ? addresse
          : `${selectedLocation.latitude};${selectedLocation.longitude}`,
      produit_contenu: products.map((product) => ({
        id_produit: parseInt(product.id) || 1,
        nb_produit: parseFloat(product.productDetails.quantite) || 1,
      })),
      liste_fourni: fournisseurListeRef.current,
    };



    console.log("Form data to send:", JSON.stringify(formData, null, 2));

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 30000);
    });

    Promise.race([
      fetch("https://backend-logistique-api-latest.onrender.com/create_command.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      }),
      timeoutPromise,
    ])
      .then(async (response) => {
        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("HTTP Error Response:", errorText);
          throw new Error(`Erreur réseau: ${response.status}`);
        }

        const responseText = await response.text();
        console.log("Server response:", responseText);

        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          throw new Error("Erreur de réponse serveur");
        }
      })
      .then((data) => {
        console.log("Succès commande:", data);

        const assignTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Assign request timeout")), 15000);
        });

        return Promise.race([
          fetch("https://backend-logistique-api-latest.onrender.com/assign.php", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }),
          assignTimeoutPromise,
        ]);
      })
      .then(async (response) => {
        console.log("Assign response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.warn("Erreur lors de l'assignation des commandes:", response.status, errorText);
          return null;
        }

        const responseText = await response.text();
        console.log("Split assign response:", responseText);
        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error("Split assign JSON Parse Error:", parseError);
          return null;
        }
      })
      .then((splitData) => {
        console.log("Split assign result:", splitData);
        getAlertRef().current?.showAlert(
          "Succès",
          "Commande créée avec succès! La Préparation est en cours.",
          true,
          "OK",
          null
        );

        setCommandeName("");
        setDescription("");
        setDate(new Date());
        setProducts([]);
        setSelectedLocation(null);
        setChargement(false);
        navigation.navigate("Accueil");
      })
      .catch((error) => {
        console.error("Erreur:", error);
        Alert.alert(
          "Erreur",
          "Une erreur est survenue lors de la création de la commande: " + error.message
        );
        setChargement(false);
      });
  }, [
    userDataLoading,
    selectedLocation,
    commandeName,
    products,
    dataUser,
    description,
    date,
    formatDate,
    addresse,
    navigation,
  ]);

  // Handle confirmation
  const handleConfirmationCommand = useCallback(() => {
    getAlertRef().current?.showAlert(
      "Validation de la commande",
      "Voulez vous vraiment valider cette commande?",
      true,
      "Valider",
      () => submitForm(),
      true,
      "Annuler",
      () => console.log("Annulation")
    );
  }, [submitForm]);

  // Set pre-selected products
  const setProductRec = useCallback(() => {
    if (preSelectedItem && Array.isArray(preSelectedItem)) {
      const newProducts = preSelectedItem
        .filter((item) => item)
        .map((item) => ({
          id: item.id || item.id_produit || Math.random().toString(),
          name: item.nom || item.nom_produit || "Produit",
          productDetails: {
            ...item,
            nombre: item.quantite || item.nombre || 1,
            poids: item.quantite || item.poids || 1,
          },
        }));

      setProducts((prevProducts) => [...prevProducts, ...newProducts]);
    }
  }, [preSelectedItem]);

  // Initialize app
  useEffect(() => {
    const initializeData = async () => {
      try {
        setUserDataLoading(true);
        const userData = await fileManager.read_file("auto.json");
        setDataUser(userData);
        debbug_lib.debbug_log("User data loaded: " + JSON.stringify(userData), "green");
      } catch (error) {
        console.error("Error loading user data:", error);
        setDataUser(null);
        setUserDataLoading(false);
      }finally{
        setUserDataLoading(false);
        //c'est normal que c'est false ici
      }
    };

    const initializeApp = async () => {
      try {
        await initializeData();
        await requestLocationPermission();
        await getProduct();

        if (preSelectedItem != null && preSelectedItem !== undefined) {
          setProductRec();
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };

    initializeApp();
  }, []);

  // Optimized render functions
  const renderProductItem = useCallback(
    ({ item }) => <ProductItem item={item} onPress={() => handleProductPress(item)} />,
    [handleProductPress]
  );

  const renderSelectedProduct = useCallback(
    ({ item, index }) => (
      <SelectedProductItem
        product={item}
        index={index}
        onRemove={() => removeProduct(item.id)}
      />
    ),
    [removeProduct]
  );

  const renderSupplierItem = useCallback(
    ({ item, index }) => (
      <SupplierCard
        item={item}
        index={index}
        onSelect={() => handleSupplierSelect(item)}
      />
    ),
    [handleSupplierSelect]
  );

  const keyExtractor = useCallback(
    (item, index) => item.id_produit?.toString() || index.toString(),
    []
  );

  const selectedProductKeyExtractor = useCallback(
    (item, index) => `${item.name}-${index}`,
    []
  );

  const supplierKeyExtractor = useCallback(
    (item) => item.id_fournisseur.toString(),
    []
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, position: "relative" }}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          scrollEnabled={!mapInteracting}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
        >
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
              {/*
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date de livraison</Text>
                <TouchableOpacity style={styles.datePickerButton} onPress={openDatePicker}>
                  <Text style={styles.datePickerButtonText}>
                    {dayjs(date).format("DD/MM/YYYY HH:mm")}
                  </Text>
                  <Image
                    source={require("../assets/Icons/calendar-icon.png")}
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
              </View>*/}

              {/* Product Modal */}
              <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Produit sélectionné:</Text>
                    <Text style={styles.modalTextSelected}>{selectedProduct?.key}</Text>

                    {selectedProduct?.originalItem?.prix_produit && (
                      <Text style={styles.modalPrice}>
                        Prix Moyen : ~{selectedProduct.originalItem.prix_produit} FCFA
                        {selectedProduct.originalItem.type_vendu === "poids"
                          ? " / kg"
                          : " / unité"}
                      </Text>
                    )}

                    <Text style={styles.modalText}>Quantité (nombre de pièces):</Text>
                    <TextInput
                      style={styles.inputNB}
                      placeholder="Ex: 10"
                      keyboardType="numeric"
                      value={nombre}
                      onChangeText={setNombre}
                    />

                    <View style={styles.buttonModal}>
                      <TouchableOpacity
                        style={styles.modalButtonAnnul}
                        onPress={() => setModalVisible(false)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.modalButtonTextAnnul}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalButtonOK}
                        onPress={handleProductConfirm}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.modalButtonText}>Confirmer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Supplier Modal */}
              <Modal
                animationType="fade"
                transparent={true}
                visible={modalFourniVisible}
                onRequestClose={() => setModalFourniVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, { width: "90%", maxHeight: "80%" }]}>
                    <TouchableOpacity
                      onPress={() => setModalFourniVisible(false)}
                      style={{ alignSelf: "flex-start", marginLeft: 15 }}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="close" size={32} color="#111" />
                    </TouchableOpacity>

                    <Text style={styles.supplierModalTitle}>
                      Choisissez le livreur le plus proche
                    </Text>

                    <TouchableOpacity
                      onPress={handleExpressDelivery}
                      activeOpacity={0.8}
                      style={styles.expressDeliveryButton}
                    >
                      <View style={styles.expressDeliveryContent}>
                        <MaterialCommunityIcons
                          name="truck-fast-outline"
                          size={28}
                          color="#fff"
                          style={{ marginRight: 10 }}
                        />
                        <Text style={styles.expressDeliveryText}>Livraison Éclair</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.orDivider}>
                      <View style={styles.dividerLine}></View>
                      <Text style={styles.orText}>OU</Text>
                      <View style={styles.dividerLine}></View>
                    </View>

                    <Text style={styles.supplierListTitle}>
                      Choisissez parmi la liste des fournisseurs
                    </Text>

                    <FlatList
                      data={fourni}
                      renderItem={renderSupplierItem}
                      keyExtractor={supplierKeyExtractor}
                      contentContainerStyle={styles.productGrid}
                      showsVerticalScrollIndicator={false}
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={5}
                      windowSize={5}
                    />
                  </View>
                </View>
              </Modal>

              {/* Search Input */}
              <Text style={styles.inputLabel}>Rechercher vos produits</Text>
              <View style={styles.SearchInputText}>
                <TextInput
                  style={styles.inputTextSearch}
                  keyboardType="default"
                  placeholder="Rechercher un produit ou une catégorie"
                  placeholderTextColor="#a2a2a9"
                  value={searchText}
                  onChangeText={setSearchText}
                />
                <Image
                  source={require("../assets/Icons/Dark-Search.png")}
                  style={styles.imageSearch}
                />
              </View>

              {/* Products List Section */}
              <SafeAreaView style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Produits commandable</Text>
                <View style={styles.productListContainer}>
                  <FlatList
                    data={filteredProduits}
                    keyExtractor={keyExtractor}
                    renderItem={renderProductItem}
                    ListEmptyComponent={
                      <Text style={styles.emptyListText}>Aucun produit trouvé</Text>
                    }
                    showsVerticalScrollIndicator={true}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    style={styles.productFlatList}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={10}
                    windowSize={10}
                  />
                </View>
              </SafeAreaView>

              {/* Selected Products */}
              {products.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Produits Sélectionnés</Text>
                  <FlatList
                    data={products}
                    renderItem={renderSelectedProduct}
                    keyExtractor={selectedProductKeyExtractor}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                  />

                  {/* Total */}
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>
                      Total: {totalAmount.toLocaleString()} FCFA
                    </Text>
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
                    activeOpacity={0.7}
                  >
                    <Image
                      source={require("../assets/Icons/location-icon.png")}
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
                  {selectedLocation &&
                    selectedLocation.latitude &&
                    selectedLocation.longitude && (
                      <View style={styles.coordinatesContainer}>
                        <Image
                          source={require("../assets/Icons/marker-icon.png")}
                          style={styles.markerIcon}
                        />
                        <Text style={styles.coordinatesText}>
                          {selectedLocation.latitude.toFixed(6)},{" "}
                          {selectedLocation.longitude.toFixed(6)}
                        </Text>
                      </View>
                    )}
                </View>

                <View style={styles.orDivider}>
                  <View style={styles.dividerLine}></View>
                  <Text style={styles.orText}>OU</Text>
                  <View style={styles.dividerLine}></View>
                </View>

                <Text style={[styles.tapInstruction, { marginBottom: 10 }]}>
                  Entrez votre addresse manuellement
                </Text>
                <TextInput
                  style={[styles.inputDesc, { height: 60 }]}
                  placeholder="ex: 98JM+HPR, Cotonou, Bénin"
                  placeholderTextColor="#a2a2a9"
                  numberOfLines={1}
                  maxLength={200}
                  value={addresse}
                  onChangeText={setAddresse}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (chargement || userDataLoading) && styles.submitButtonDisabled,
                ]}
                onPress={handleConfirmationCommand}
                disabled={chargement || userDataLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>
                  {userDataLoading
                    ? "Chargement..."
                    : chargement
                    ? "Envoi en cours..."
                    : "Valider la commande"}
                </Text>
                {(chargement || userDataLoading) && (
                  <ActivityIndicator color="#fff" style={styles.loadingIndicator} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <Snackbar ref={snackBarRef} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  form: {
    marginTop: 15,
  },
  textH1: {
    fontSize: 24,
    marginVertical: 15,
    color: "#2E3192",
    fontWeight: "700",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#555",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: "#333",
    backgroundColor: "#fff",
    borderColor: "#ddd",
    fontSize: 15,
  },
  inputFocused: {
    borderColor: "#2E3192",
    borderWidth: 1.5,
    shadowColor: "#2E3192",
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
    color: "#333",
    backgroundColor: "#fff",
    borderColor: "#ddd",
    textAlignVertical: "top",
    fontSize: 15,
  },
  datePickerButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePickerButtonText: {
    color: "#333",
    fontSize: 15,
  },
  calendarIcon: {
    width: 20,
    height: 20,
    tintColor: "#555",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  modalTextSelected: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
    backgroundColor: "#f8f8f8",
    padding: 10,
    width: "80%",
    textAlign: "center",
    fontWeight: "500",
    borderRadius: 7,
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
  },
  inputNB: {
    height: 40,
    borderWidth: 2.5,
    borderRadius: 7,
    width: "80%",
    padding: 10,
    color: "#111",
    marginBottom: 20,
    marginTop: 5,
    alignSelf: "center",
    backgroundColor: "#f8f8f8",
    borderColor: "#666",
  },
  buttonModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    width: "100%",
  },
  modalButtonOK: {
    backgroundColor: "#45b308",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  modalButtonAnnul: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    borderColor: "#c51b18",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalButtonTextAnnul: {
    color: "#c51b18",
    fontSize: 16,
    fontWeight: "bold",
  },
  supplierModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 15,
    textAlign: "center",
  },
  expressDeliveryButton: {
    marginTop: 15,
    marginBottom: 15,
  },
  expressDeliveryContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  expressDeliveryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  supplierListTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 15,
    marginBottom: 15,
    textAlign: "center",
  },
  SearchInputText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderColor: "#ddd",
  },
  inputTextSearch: {
    flex: 1,
    height: "100%",
    color: "#333",
    fontSize: 15,
  },
  imageSearch: {
    width: 20,
    height: 20,
    tintColor: "#666",
  },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E3192",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productListContainer: {
    height: 250,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  productFlatList: {
    flex: 1,
    paddingHorizontal: 5,
  },
  productItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    backgroundColor: "#fff",
    marginVertical: 1,
    marginHorizontal: 5,
    borderRadius: 6,
  },
  productItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  productTextContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
  productUnit: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  emptyListText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginVertical: 40,
    fontSize: 14,
  },
  containerProduct: {
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
    marginTop: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#45b308",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productInfoText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  productPriceText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
    marginVertical: 2,
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  productActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#ffebee",
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  totalContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E3192",
  },
  locationHelpText: {
    color: "#666",
    fontSize: 13,
    marginBottom: 15,
    textAlign: "center",
  },
  locationButtons: {
    alignItems: "center",
    marginBottom: 15,
  },
  locationButton: {
    backgroundColor: "#2E3192",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  locationIcon: {
    width: 16,
    height: 16,
    tintColor: "#fff",
    marginRight: 8,
  },
  locationButtonText: {
    color: "white",
    fontWeight: "500",
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },
  orText: {
    marginHorizontal: 10,
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
  tapInstruction: {
    color: "#666",
    fontSize: 13,
    textAlign: "center",
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  coordinatesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  markerIcon: {
    width: 14,
    height: 14,
    tintColor: "#2E3192",
    marginRight: 6,
  },
  coordinatesText: {
    fontSize: 12,
    color: "#555",
  },
  submitButton: {
    backgroundColor: "#45b308",
    padding: 16,
    borderRadius: 8,
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#45b308",
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
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    position: "relative",
  },
  cheapestCard: {
    borderColor: "#2E7D32",
    borderWidth: 2,
    backgroundColor: "#F8FFF8",
  },
  bestPriceBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  bestPriceText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  supplierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  supplierInfo: {
    flex: 1,
    marginRight: 12,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  supplierDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  productGrid: {
    paddingBottom: 20,
  },
});

export default Formulaire;
