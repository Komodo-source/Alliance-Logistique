import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, FlatList, Dimensions } from 'react-native';
import RFNS from 'react-native-fs';

export const loadImages = (id_produit) => {
  switch(id_produit){
      case "1":
          return require('../../assets/img_product/1.jpg');
      case "2":
          return require('../../assets/img_product/1.jpg');
      case "3":
          return require('../../assets/img_product/1.jpg');

      default:
          return require('../../assets/img_product/default.png');
  }
}

const Produit = ({ navigation }) => {
  const [produits, setProduits] = useState([]);
  const [commandeName, setCommandeName] = useState('');
  const fileProduct = RFNS.DocumentDirectoryPath + '/assets/data/product.json';

  const isProductEmpty = async () => {
    try {
      const content = await RNFS.readFile(filePath, 'utf8');
      return JSON.parse(content).length == 0;
    } catch (error) {
      console.error('Erreur de lecture:', error);
      return null;
    }
  };

  const getProductFromJson = async () => {
    try {
      const content = await RNFS.readFile(fileProduct, 'utf8');
      setProduits(JSON.parse(content));
    } catch (error) {
      console.error('Erreur de lecture:', error);
      return null;
    }
  };

  const writeProductToJson = async (produits) => {
    try {
      await RNFS.writeFile(fileProduct, JSON.stringify(produits, null, 2), 'utf8');
      console.log('Produits écrits dans le fichier JSON');
    } catch (error) {
      console.error('Erreur d\'écriture:', error);
    }
  };


  const getProduct = () => {
    fetch('https://backend-logistique-api-latest.onrender.com/product.php')
      .then((response) => response.json())
      .then((data) => {
        console.log("Produits reçus:", data);
        setProduits(data);
      })
      .catch((error) => console.error(error));
  }


  //je préfère mettre ici le script pour récupérer les produits pour éviter 
  // de surcharger la connexion user au début
  useEffect(() => {
    if (isProductEmpty()) {
      //on check de base si nous n'avons pas les produits dans le fichier json
      getProduct();
    }else {
      getProductFromJson();
    }
    writeProductToJson(produits);
  }, []);

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

    <TextInput
       style={styles.input}
       keyboardType="default"
       placeholder="Rechercher un produit"
       placeholderTextColor="#a2a2a9"
       value={commandeName}
       onChangeText={setCommandeName}
    />

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
    width: '90%',
    padding: 10,
    color: '#111',
    marginBottom: 20,
    marginTop: 45,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
});

export default Produit;