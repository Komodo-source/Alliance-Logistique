import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, FlatList, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadImages = (id_produit) => {
  switch(id_produit){
      case "1":
          return require('../assets/img_product/3.jpg'); 
      case "2":
          return require('../assets/img_product/2.jpg');
      case "3":
          return require('../assets/img_product/3.jpg');
      case "4":
          return require('../assets/img_product/4.jpg');        
      case "8":
          return require('../assets/img_product/8.jpg');
      case "10":
          return require('../assets/img_product/10.jpg');
      case "11":
          return require('../assets/img_product/11.jpg');
      case "12":
          return require('../assets/img_product/12.jpg');
      default:
          return require('../assets/img_product/default.png');
  }
}

const Produit = ({ navigation }) => {
  const [produits, setProduits] = useState([]);
  const [allProduits, setAllProduits] = useState([]); 
  const [commandeName, setCommandeName] = useState('');
  const STORAGE_KEY = '@products_data';
  let  storage;

  const isProductEmpty = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue == null || JSON.parse(jsonValue).length === 0;
    } catch (error) {
      console.error('Erreur de lecture:', error);
      return null;
    }
  };

  const getProductFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        setProduits(data);
        setAllProduits(data); // <- ADD this
      }
    } catch (error) {
      console.error('Erreur de lecture:', error);
    }
  };

  const writeProductToStorage = async (produits) => {
    try {
      const jsonValue = JSON.stringify(produits);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      console.log('Produits écrits dans le stockage');
    } catch (error) {
      console.error('Erreur d\'écriture:', error);
    }
  };

  const saveProductsToStorage = async (products) => {
    try {
      const jsonString = JSON.stringify(products);
      await AsyncStorage.setItem('@products_json', jsonString);
      console.log('Produits sauvegardés dans AsyncStorage');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans AsyncStorage:', error);
    }
  };

  const loadProductsFromStorage = async () => {
    try {
      const jsonString = await AsyncStorage.getItem('@products_json');
      if (jsonString) {
        return JSON.parse(jsonString);
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la lecture depuis AsyncStorage:', error);
      return null;
    }
  };

  const getProduct = async () => {
    try {
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/product.php');
      const data = await response.json();
      console.log("Produits reçus:", data);
      setProduits(data);
      setAllProduits(data);
      await saveProductsToStorage(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const empty = await isProductEmpty();
      if (empty) {
        const storedData = await loadProductsFromStorage();
        if (storedData) {
          setProduits(storedData);
          setAllProduits(storedData);
        } else {
          await getProduct();
        }
      } else {
        getProductFromStorage();
      }
    };
    loadData();
  }, []);

  const researchProduct = (text) => {
    setCommandeName(text);
    if (text.trim() === "") {
      setProduits(allProduits);
    } else {
      const filtered = allProduits.filter(item =>
        item.nom_produit.toLowerCase().includes(text.toLowerCase())
      );
      setProduits(filtered);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.productCard}
    onPress={() => navigation.navigate('DetailProduit', {item})}>
      
      <Image 
        source = {loadImages(item.id_produit)}
        style={styles.productImage}
      />          
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.nom_produit}</Text>
        <Text style={styles.productPrice}>{item.prix_produit} FCFA</Text>
        <Text style={styles.deliveryTime}>~3h</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.input}
        keyboardType="default"
        placeholder="Rechercher un produit"
        placeholderTextColor="#a2a2a9"
        value={commandeName}
        onChangeText={researchProduct}
      />      
      <Image 
          source = {require('../assets/Icons/Dark-Search.png')}
          style={styles.imageSearch}
        />  
    </View>

      <FlatList
        data={produits}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id_produit.toString()}
        numColumns={2}
        contentContainerStyle={styles.productGrid}
      />

      <View style={styles.navbar}> 
        <TouchableOpacity 
          style={[styles.navButton, styles.activeButton]}
          onPress={() => navigation.navigate('Produit')}
        >
          <Text style={styles.navButtonText}>Produit</Text>
          <Image
            style={styles.logoNavBar}
            source={require('../assets/Icons/Dark-Product.png')}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Accueil')}
        >
          <Text style={styles.navButtonText}>Accueil</Text>
          <Image
            style={styles.logoNavBar}
            source={require('../assets/Icons/Dark-House.png')}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Hub')}
        >
          <Text style={styles.navButtonText}>Hub</Text>
          <Image
            style={styles.logoNavBar}
            source={require('../assets/Icons/Dark-Hub.png')}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Profil')}
        >
          <Text style={styles.navButtonText}>Profil</Text>
          <Image
            style={styles.logoNavBar}
            source={require('../assets/Icons/Dark-profile.png')}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6EE',
  },
  productGrid: {
    padding: 10,
    paddingBottom: 80, // Pour laisser de l'espace pour la navbar
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    padding: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  logoNavBar: {
    width: 30,
    height: 30,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F9F6EE',
    backgroundColor: '#F9F6EE',
  },
  navButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'column',
    alignItems: 'center'
  },
  activeButton: {
    borderRadius: 40,
    backgroundColor: '#7CC6FE',
    width: 120
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderWidth: 2.5,
    borderRadius: 5,
    width: '80%',
    padding: 10,
    color: '#111',
    marginBottom: 20,
    marginTop: 45,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  imageSearch: {
    width: 30,
    height: 30,
    marginTop: 25,
    marginLeft: -30,
  },
  searchContainer : {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    justifyContent: 'space-around',
  },
});

export default Produit;