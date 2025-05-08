import React from 'react';
import { View, Text, Button, StyleSheet, MapView, Marker, PROVIDER_GOOGLE, TouchableOpacity} from 'react-native';

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
    //const [selectedLocation, setSelectedLocation] = useState(null);

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
              showsUserLocation={hasLocationPermission && userLocation !== null}              
            >
            <Marker
              coordinate={region}
              title="Localisation Séléctionné"
            />              
            </MapView>
          </View>
        <View style={styles.info_comple}>
          <Text>Date de livraison: {item.date_fin}</Text>
          <Text>Status: Livraison en cours</Text>
          <Text>Bon de livraison: {item.id_public_cmd}</Text>
          {/*faire une flat list de tout les produits commandées*/ }
          <FlatList
            data={item.produits}
            renderItem={({ item }) => <Text>{item.nom_produit}</Text>}
          />
          <Text>Total: {item.prix_total} FCFA</Text> 
          {/*AJoutées un prix total de la commande*/ }
        </View>

        <View style={styles.Footer}>
          <TouchableOpacity style={styles.button}>
            <Text>Générer une facture</Text>
          </TouchableOpacity>
        </View>
       </View>
    </View>
  );
};

const styles = StyleSheet.create({
});

export default detail_Commande;