import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, FlatList, Image} from 'react-native';
import MapView,{Marker, PROVIDER_GOOGLE} from 'react-native-maps';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};


const detail_Commande = ({ route, navigation }) => {
    const { item } = route.params;
    console.log(item);
    const [region, setRegion] = useState({
      latitude: 9.3077,
      longitude: 2.3158,
      latitudeDelta: 0.0421,
      longitudeDelta: 0.822,
    });
    const [selectedLocation, setSelectedLocation] = useState(null);


    useEffect(() => {
      setSelectedLocation({
        latitude: parseFloat(item.localisation_dmd.split(';')[0]),  
        longitude: parseFloat(item.localisation_dmd.split(';')[1]),
      });
    }, []);

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

  return (
    
    <View style={styles.container}>
       <View style={styles.main}>

        <View style={styles.header}>
          <View style={styles.head_info}>
        <View style={styles.header_title}>
          <Text style={styles.title}>{item.nom_dmd}</Text>
          <Text style={styles.date}>{item.desc_dmd}</Text>
          </View>
          <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                region={region}
                provider={PROVIDER_GOOGLE}              
                showsMyLocationButton={false}
                //onPress={handleMapPress}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={selectedLocation}
                    title="Localisation Séléctionné"
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
                    source={require('../../assets/Icons/marker-icon.png')} 
                    style={styles.markerIcon}
                  />
                  <Text style={styles.coordinatesText}>
                    {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>
          </View> 

          </View>
        <View style={styles.info_comple}>
          <Text style={{fontSize: 16, fontWeight: "bold"}}>Date de livraison: {item.date_fin}</Text>
          <Text>Status: Livraison en cours</Text>
          <Text>Bon de commande: {item.id_public_cmd}</Text>
          <Text>Lieu de livraison: {item.localisation_dmd}</Text>
          
          <Text style={{fontSize: 18, fontWeight: "bold", marginTop: 30}}>Produits</Text>
          <FlatList
            data={item}
            renderItem={({ item }) => (
              <View style={styles.produitItem}>
                {/*<Text>{produit.nom_produit}</Text>*/}
                <Text>{item.id_produit}</Text>
                <Text>{item.nom_produit}</Text>
              </View>
            )}
            
            keyExtractor={ item => item.id_produit.toString()  }
          />
          <Text style={styles.prix_total}>Total: {item.prix_total} FCFA</Text> 
          {/*AJoutées un prix total de la commande*/ }
        </View>

        <View style={styles.Footer}>
          <TouchableOpacity style={styles.button}>
            <Text style={{color : "#fff", fontSize: 19, fontWeight: "500"}}>Générer une facture</Text>
          </TouchableOpacity>
        </View>
       </View>
    </View>
  );
};

const styles = StyleSheet.create({
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  main: {
    flex: 1,
    padding: 15,
  },
  head_info : {
    display: "flex",
  },
  header: {
    marginBottom: 20,
    
  },
  header_title: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  map: {
    height: 200,
    borderRadius: 50,
  },
  info_comple: {
    flex: 1,
  },
  produitItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  Footer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#7CC6FE',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',

  },
  prix_total: {
    fontSize: 19,
    fontWeight: "800",
    fontStyle: "italic",
  },
  //typical style for map
  map_info: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 8px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
  },
  button_map: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  }
});

export default detail_Commande; 