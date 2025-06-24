import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, FlatList, Dimensions } from 'react-native';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';


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
  const fileUri = FileSystem.documentDirectory + 'product.json';

  const checkIfProductFileEmpty = async() => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
  
      if (!fileInfo.exists) {
        console.log('File does not exist.');
        return true;
      }
  
      const content = await FileSystem.readAsStringAsync(fileUri);
      const isEmpty = content.trim().length === 0;
      
      console.log('Is file empty?', isEmpty);
      return isEmpty;
    } catch (error) {
      console.error('Error checking file:', error);
      return true;
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
        console.log("as reçus du serveur:", data);
      }
      setProduits(data);
      setAllProduits(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await getProduct();

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
        <View style={styles.iconContainer}>
          <Image
            style={[styles.logoNavBar, styles.activeIcon]}
            source={require('../assets/Icons/Dark-Product.png')}
          />
        </View>
        <Text style={[styles.navButtonText, styles.activeText]}>Produit</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigation.navigate('Accueil')}
      >
        <View style={styles.iconContainer}>
          <Image
            style={styles.logoNavBar}
            source={require('../assets/Icons/Dark-House.png')}
          />
        </View>
        <Text style={styles.navButtonText}>Accueil</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigation.navigate('Hub')}
      >
        <View style={styles.iconContainer}>
          <Image
            style={styles.logoNavBar}
            source={require('../assets/Icons/Dark-Hub.png')}
          />
        </View>
        <Text style={styles.navButtonText}>Hub</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigation.navigate('Profil')}
      >
        <View style={styles.iconContainer}>
          <Image
            style={styles.logoNavBar}
            source={require('../assets/Icons/Dark-profile.png')}
          />
        </View>
        <Text style={styles.navButtonText}>Profil</Text>
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
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    minHeight: 60,
  },
  
  activeButton: {
    backgroundColor: '#7CC6FE',
    shadowColor: '#7CC6FE',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  iconContainer: {
    marginBottom: 4,
    padding: 2,
  },
  
  logoNavBar: {
    width: 24,
    height: 24,
    tintColor: '#666666',
  },
  
  activeIcon: {
    tintColor: '#FFFFFF',
    width: 26,
    height: 26,
  },
  
  navButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  
  activeText: {
    color: '#FFFFFF',
    fontWeight: '600',
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