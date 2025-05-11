import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
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

  return (
    <View style={styles.container}>
       <View style={styles.main}>

        <View style={styles.header}>
        <View style={styles.header_title}>
          <Text style={styles.title}>{item.nom_dmd}</Text>
          <Text style={styles.date}>{item.desc_dmd}</Text>
          </View>
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

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  main: {
    flex: 1,
    padding: 15,
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
    borderRadius: 10,
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
});

export default detail_Commande; 