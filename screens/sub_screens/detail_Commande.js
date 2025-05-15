import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

var headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

export const loadImages = (id_produit) => {
  switch (id_produit) {
    case "1":
      return require('../../assets/img_product/3.jpg');
    case "2":
      return require('../../assets/img_product/2.jpg');
    case "3":
      return require('../../assets/img_product/3.jpg');
    case "4":
      return require('../../assets/img_product/4.jpg');
    case "8":
      return require('../../assets/img_product/8.jpg');
    case "10":
      return require('../../assets/img_product/10.jpg');
    case "11":
      return require('../../assets/img_product/11.jpg');
    case "12":
      return require('../../assets/img_product/12.jpg');
    default:
      return require('../../assets/img_product/default.png');
  }
}

const detail_Commande = ({ route, navigation }) => {
  const { item } = route.params;
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

  const renderStatusBadge = () => {
    return (
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Livraison en cours</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.main}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>{item.nom_dmd}</Text>
            <Text style={styles.subtitle}>{item.desc_dmd}</Text>
            {renderStatusBadge()}
          </View>

          {/* Order Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#2E3192" />
              <Text style={styles.infoText}>Date de livraison: <Text style={styles.infoValue}>{item.date_fin}</Text></Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="receipt" size={20} color="#2E3192" />
              <Text style={styles.infoText}>Bon de commande: <Text style={styles.infoValue}>{item.id_public_cmd}</Text></Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="map-marker" size={20} color="#2E3192" />
              <Text style={styles.infoText}>Lieu de livraison</Text>
            </View>
          </View>

          {/* Map Section */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              provider={PROVIDER_GOOGLE}
              showsMyLocationButton={false}
            >
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  title="Localisation Séléctionné"
                >
                  <View style={styles.customMarker}>
                    <FontAwesome name="map-pin" size={24} color="#E74C3C" />
                  </View>
                </Marker>
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
                <Text style={styles.coordinatesText}>
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </View>

          {/* Products Section */}
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Produits Achetés</Text>
            
            {item.produits && item.produits.map((produit, index) => (
              <View key={index} style={styles.productItem}>
                <Image 
                  source={loadImages(produit.id_produit.toString())} 
                  style={styles.productImage} 
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{produit.nom_produit}</Text>
                  <View style={styles.productMeta}>
                    <Text style={styles.productQuantity}>{produit.quantite}</Text>
                    <Text style={styles.productType}>{produit.type_vendu}</Text>
                    <Text style={styles.productPrice}>{produit.prix_vendu} FCFA</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Total Price Section */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>{item.prix_total} FCFA</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.invoiceButton}>
          <MaterialIcons name="receipt" size={24} color="white" />
          <Text style={styles.invoiceButtonText}>Générer une facture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  main: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFA726',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#34495e',
    marginLeft: 10,
  },
  infoValue: {
    fontWeight: '600',
    color: '#2c3e50',
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
  customMarker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eaeaea',
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
  coordinatesContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#34495e',
  },
  productsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productQuantity: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 10,
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productType: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 10,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
    marginLeft: 'auto',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3192',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  invoiceButton: {
    backgroundColor: '#2E3192',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default detail_Commande;