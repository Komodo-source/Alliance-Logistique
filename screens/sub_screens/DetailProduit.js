import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity,ScrollView, FlatList, SafeAreaView, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { debbug_log } from '../util/debbug';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getUserDataType } from '../util/Polyvalent';
import * as FileManager from '../util/file-manager'

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};

export const loadImages = (id_produit) => {
  switch(id_produit){
      case "1":
          return 'https://arena.ct.ws/product/3.jpg';
      case "2":
          return 'https://arena.ct.ws/product/2.jpg';
      case "3":
          return 'https://arena.ct.ws/product/3.jpg';
      case "4":
          return 'https://arena.ct.ws/product/4.jpg';
      case "8":
          return 'https://arena.ct.ws/product/8.jpg';
      case "10":
          return 'https://arena.ct.ws/product/10.jpg';
      case "11":
          return 'https://arena.ct.ws/product/11.jpg';
      case "12":
          return 'https://arena.ct.ws/product/12.jpg';
      default:
          return 'https://arena.ct.ws/product/default.jpg';
  }
}


const DetailProduit = ({ route, navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [fourni, setFourni] = useState(null);
  const [estCharge, setFourniCharge] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [userType, setIsClient] = useState('');

    const { item } = route.params;
    console.log(item );


  const getCurrentLocation = async () => {
    try {
      // Request permission first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to calculate distances');
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      console.log("Current location:", latitude, longitude);
      setUserLocation({ latitude, longitude });
      setLocationLoading(false);

    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not get your current location');
      setLocationLoading(false);
    }
  };


  const getFourni = async () => {
    let data = {};
    try {

      // va chercher la liste des fournisseurs produisant le même
      // produit afin de les comparer

      const response = await fetch('https://backend-logistique-api-latest.onrender.com/get_fournisseur_produit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id_produit: item.id_produit})
      });
      data = await response.json();
      console.log("reçus du serveur:", data);

      setFourni(data);
      setFourniCharge(true);
      console.log("Fourni fetched:", data);

    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
    }
  };


  const localisationToKm = (loca) => {
    // Return null if user location is not available
    if (!userLocation) {
      return null;
    }

    let lat = parseFloat(loca.split(";")[0]);
    let long = parseFloat(loca.split(";")[1]);

    const radiusEarthKm = 6371.07103;
    // Convert degrees to radians
    const toRadians = deg => deg * (Math.PI / 180);

    const latFrom = toRadians(lat);
    const latTo = toRadians(userLocation.latitude);
    const latDiff = latTo - latFrom;
    const lngDiff = toRadians(userLocation.longitude - long);

    // Haversine formula
    const a = Math.sin(latDiff / 2) ** 2 +
              Math.cos(latFrom) * Math.cos(latTo) *
              Math.sin(lngDiff / 2) ** 2;

    const c = 2 * Math.asin(Math.sqrt(a));
    const distance = radiusEarthKm * c;
    console.log(`Real distance from pointA to pointB is ${distance} km`);
    return distance;
  }

const renderFourniChoix = ({ item: fourni, index }) => {
  const isFirstSupplier = index === 0; // First supplier is cheapest
  const distance = fourni.localisation_orga !== null ? localisationToKm(fourni.localisation_orga) : null;

  return (
    // Removed ScrollView wrapper - this was causing the VirtualizedList warning
    <TouchableOpacity
      style={[
        styles.productCard,
        isFirstSupplier && styles.cheapestCard
      ]}
      onPress={() => navigation.navigate('ProfilPublic', {id: fourni.id_fournisseur, type: "fournisseur"})}
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
          <Ionicons name="cart" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.supplierDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>
            {distance !== null && !locationLoading
              ? `${distance.toFixed(1)} km`
              : fourni.ville_organisation || 'Adresse non renseignée'
            }
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>
            Stock: {fourni.nb_produit_fourni} unités
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await getUserDataType(); // or FileManager.read_file("auto.json")
      debbug_log(data.type, "cyan");
      setIsClient(data.type);

      // Use data.type directly, not userType state
      if(data.type === "client"){
        getCurrentLocation();
        getFourni();
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  loadData();
}, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
            <View >
                <Text style={styles.title}>{item.nom_produit}</Text>
                <Text style={styles.categorie}>Catégorie: {item.nom_categorie}</Text>
            </View>
            <Image
            source={{uri: loadImages(item.id_produit)}} style={styles.image} />
        </View>


        <Text style={styles.description}>Ceci est une description du produit le temps que l'on introduise la description du produit</Text>
      {userType === "client" ? (<View>
  <TouchableOpacity
          style={styles.Panier}
          onPress={() => navigation.navigate('commande_reccurente')}
        >
          <Text style={{color: "#fff", fontSize: 19, fontWeight: "500", numberOfLines:1, adjustsFontSizeToFit:true}}>
            Ajouter à une commande récurrente
          </Text>
        </TouchableOpacity>

        <SafeAreaView style={styles.listFourni}>
          <Text style={styles.NbFourni}>Nombre de fournisseur produisant<Text style={{color: "#2757F5"}}> {item.nom_produit}</Text> : {item.nb_fournisseur}</Text>
          {item.nb_fournisseur == 0 ? (
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="truck-remove-outline"
                  size={48}
                  color="#94a3b8"
                />
              </View>
              <Text style={styles.title}>Aucun fournisseur disponible</Text>
              <Text style={styles.description}>
                Aucun fournisseur ne peut actuellement remplir votre commande.
                Veuillez réessayer ultérieurement.
              </Text>
            </View>
          ) : estCharge ? (
            <FlatList
              data={fourni}
              renderItem={renderFourniChoix}
              keyExtractor={(fourni) => fourni.id_fournisseur.toString()}
              numColumns={1}
              contentContainerStyle={styles.productGrid}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner}>
                <Text style={styles.loadingEmoji}>⏳</Text>
              </View>
              <Text style={styles.loadingText}>Chargement des Fournisseurs...</Text>
            </View>
          )}

        </SafeAreaView >
      </View>) : null}

    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
 card: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',


  },
  iconContainer: {
    backgroundColor: '#f1f5f9',
    width: "80%",
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#334155',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listFourni : {
    flex: 1,
    marginBottom: 30
  },
  NbFourni : {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 20,
    marginLeft: 20,
    color: "#64748B",
    marginBottom: 10
  },
    main : {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    image : {
        width: 180,
        height: 180,
        borderRadius: 8,
        marginBottom: 8,
        marginRight: 35,
        marginTop: 35,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title : {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 45,
        marginLeft: 25,
        width: '80%',
    },

    price : {
        fontSize: 16,
        marginBottom: 10,
        marginTop: 20,
        fontWeight : '600',
        color : '#2E7D32',
        marginLeft: 25,
    },
    description : {
        fontSize: 16,
        marginLeft: 25,
        marginRight: 25,
        marginTop: 20,
        fontWeight: '450',
    },
    categorie : {
        fontSize: 16,
        marginLeft: 25,
        marginRight: 25,
        marginTop: 15,
        fontWeight: '600',
    },
    LoginButton : {
        height: 40,
        borderRadius: 7,
        width: '80%',
        backgroundColor: '#2E7D32',
        alignSelf: 'center',
        marginTop: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },

      Panier : {
        height: 60,
        borderRadius: 7,
        width: '80%',
        minWidth: 180,
        paddingHorizontal: 8,
        backgroundColor: '#0141d2',
        alignSelf: 'center',
        marginTop: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

      },

      loadingContainer: {

        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
      },

        loadingSpinner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',

      },
        loadingEmoji: {
          fontSize: 24,
        },
        loadingText: {
          fontSize: 16,
          color: '#64748B',
          fontWeight: '600',
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
    backgroundColor: '#FF8C00',
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
})

export default DetailProduit;
