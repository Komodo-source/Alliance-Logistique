import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Image, FlatList, Dimensions, ScrollView } from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import data from './../assets/data/auto.json'
import * as FileSystem from 'expo-file-system';
import CarouselCards from './sub_screens/CarouselCards';


const defaultDataWith6Colors = [
	"#B0604D",
	"#899F9C",
	"#B3C680",
	"#5C6265",
	"#F5D399",
	"#F1F1F1",
];

//erreur
// ReanimatedError: [Reanimated] Native part of Reanimated doesn't seem to be initialized (Worklets).
//See https://docs.swmansion.com/react-native-reanimated/docs/guides/troubleshooting#native-part-of-reanimated-doesnt-seem-to-be-initialized for more details.

const Accueil = ({ navigation }) => {
  const [commande, setCommande] = useState([]);

  const renderItem = ({ rounded }) => ({ item }) => (
    <View style={{
      backgroundColor: item.color,
      height: 250,
      borderRadius: rounded ? 20 : 0,
      marginHorizontal: 10,
    }} />
  );


  const readProductFile = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + 'product.json';
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
      
      // Enhanced error logging
      if (error instanceof SyntaxError) {
        console.error('Failed to parse JSON - file may be corrupted');
      } else if (error.code === 'ENOENT') {
        console.error('File not found - path may be incorrect');
      }
      
      return null;
    }
  };

  const fetch_commande = () => {
    readProductFile();
    const id_client = data.id;
    console.log("id_client : ", id_client);
    fetch('https://backend-logistique-api-latest.onrender.com/recup_commande_cli.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id_client})
    })
    .then(response => response.json())
    .then(data => {
      data = data.slice(0,2);
      console.log("Received data:", data);
      if (!data || data.length === 0) {
        console.log("No data received or empty array");
        setCommande([]); 
      } else {
        setCommande(data); 
      }
    })
    .catch(error => {
      console.log("Error fetching data:", error);
      setCommande([]); // Set empty array on error
    });
  }
  const renderCommande = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.commandeCard}
        onPress={() => navigation.navigate('detail_Commande', {item})}
      >
        <Text style={{fontSize: 18, fontWeight: "800", marginBottom: 5, color: "#2c3e50"}}>{item.nom_dmd}</Text>
        <Text style={{fontSize: 15, fontWeight: "300", marginLeft: 15, marginBottom: 5, color: "#2c3e50"}}>
          Date de livraison: {new Date(item.date_fin).toLocaleDateString()}
        </Text>
        {/*<Text style={{fontSize: 14, marginLeft: 15, marginBottom: 5}}>
          Description: {item.desc_dmd}
        </Text>*/}
        <Text style={{fontSize: 14, marginLeft: 15, marginBottom: 5}}>
          Numéro de commande: {item.id_public_cmd}
        </Text>
        <View style={{marginLeft: 15, marginTop: 5}}>
          {/*<Text style={{fontSize: 14, fontWeight: "600", marginBottom: 3}}>Produits:</Text>
          {item.produits && item.produits.map((produit, index) => (
            <Text key={index} style={{fontSize: 13, marginLeft: 10}}>
              • {produit.nom_produit} - {produit.quantite} {produit.type_vendu}
            </Text>
          ))}*/}
        </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    fetch_commande();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.carouselContainer}>
          <CarouselCards />
        </View>

        <View style={styles.commandeBox}>
          {commande && commande.length > 0 ? (     
            <View style={styles.commandeDiv}>     
              <Text style={styles.commandeTitle}>Vos commandes</Text>    
              <FlatList
                data={commande}
                renderItem={renderCommande}
                keyExtractor={(item) => item.id_dmd.toString()}
              />
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Hub')}>
                <Text style={styles.viewAllButtonText}>Voir toutes les commandes  {">"}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Vous n'avez passé aucune commande pour le moment
              </Text>
              <TouchableOpacity 
                style={styles.newOrderButton}
                onPress={() => navigation.navigate('Formulaire')}>
                <Text style={styles.newOrderButtonText}>Passer une commande</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Formulaire')}>
        <Image 
          source={require('../assets/Icons/Light-commande.png')} 
          style={styles.floatingButtonIcon}
        />
        <Text style={styles.floatingButtonText}>Passer une commande</Text>
      </TouchableOpacity>

      <View style={styles.navbar}> 
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Produit')}
        >
          <Text style={styles.navButtonText}>Produit</Text>
          <Image
            style={styles.logoNavBar}
            source={require('../assets/Icons/Dark-Product.png')}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, styles.activeButton]}
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
  scrollView: {
    flex: 1,
  },
  carouselContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  commandeBox: {
    flex: 1,
    marginBottom: 100,
  },
  commandeDiv: {
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingBottom: 20,
    paddingTop: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  commandeTitle: {
    fontSize: 21,
    fontWeight: "800",
    marginLeft: 15,
    marginBottom: 5,
    marginTop: 15,
    color: "#2c3e50"
  },
  commandeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 8,
    shadowColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  newOrderButton: {
    height: 40,
    borderRadius: 7,
    width: '80%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newOrderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600"
  },
  viewAllButton: {
    height: 40,
    borderRadius: 7,
    width: '80%',
    backgroundColor: "#2E3192",
    alignSelf: 'center',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600"
  },
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  floatingButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "500",
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
    fontWeight: "bold"
  },
  logoNavBar: {
    width: 30,
    height: 30,
  },
});

export default Accueil;