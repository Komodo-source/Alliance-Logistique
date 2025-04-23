import React, {useState, useEffect} from 'react';
import {Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, Modal, FlatList, View, Button, TouchableOpacity, ScrollView, Image, Alert, PermissionsAndroid} from 'react-native';

import TomateImage from '../assets/Icons/Dark-tomato.png';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import dayjs from 'dayjs';
import DatePicker from 'react-native-ui-datepicker';

const Formulaire = ({ navigation }) => {
  const [date, setDate] = useState(dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const [poids, setPoids] = useState('');
  const [nombre, setNombre] = useState('');
  const [commandeName, setCommandeName] = useState('');
  const [description, setDescription] = useState('');
  const [childViews, setChildViews] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [region, setRegion] = useState({
    latitude: 9.3077,
    longitude: 2.3158,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.822,
  });
  const [produit, setProduit] = useState([]);


  const dic_image_name = {
    "tomate": TomateImage
  };

  // Request location permission and get current location
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permission de Localisation',
          message: 'Accéder à votre location?',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        },
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setHasLocationPermission(true);
        getCurrentLocation();
        return true;
      } else {
        setHasLocationPermission(false);
        Alert.alert('Permission refusée', 'Vous devez autoriser la localisation');
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };


  const postCommande = () => {
    
  }

  const getProduct = () => {
    fetch('https://backend-logistique-api-latest.onrender.com/product.php')
    .then((response) => response.json())
    .then((data) => setProduit(data))
    .catch((error) => console.error(error));
  }

  const getCurrentLocation = () => {
    if (!hasLocationPermission) {
      Alert.alert('Permission requise', 'Vous devez autoriser la localisation');
      return;
    }
    
    Geolocation.getCurrentPosition(      
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Current location:", latitude, longitude);
        setUserLocation({ latitude, longitude });
        setSelectedLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        });
      },
      (error) => {
        console.log(error.code, error.message);
        Alert.alert('Error', 'Could not get your current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleMapPress = (e) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const add_product = (name, poids, nombre) => {
    setModalVisible(false);
    const newProduct = {
      name,
      poids,
      nombre
    };
    
    setProducts([...products, newProduct]);
    
    const newView = (
      <View style={styles.containerProduct} key={`${name}-${Date.now()}`}>
        <Text style={{fontSize: 16, fontWeight: "500"}}>{nombre}x {name} - {poids}g/pièce</Text>
        <Image
          style={styles.logoProduit}
          source={dic_image_name[name]}
        />
      </View>
    );
    setChildViews([...childViews, newView]);
    setPoids('');
    setNombre('');
  };

  const handleConfirm = (selectedDate) => {
    setOpen(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleProductPress = (item) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

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

  const handleSubmit = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    const formData = {
      commandeName,
      description,
      deliveryDate: date.toISOString(),
      products,
      location: selectedLocation 
    };

    console.log('Form data with location:', formData);

    fetch('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur réseau');
      }
      return response.json();
    })
    .then(data => {
      console.log('Succès:', data);
      alert('Commande créée avec succès!');
      setCommandeName('');
      setDescription('');
      setDate(new Date());
      setProducts([]);
      setChildViews([]);
      setSelectedLocation(null);
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la création de la commande');
    });
  };
  
  return(
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.textH1}>Formulaire de commande</Text>
          
          <View style={styles.form}>
            <Text style={styles.descInput}>Nom de la commande</Text>
            <TextInput
              style={styles.input}
              keyboardType="default"
              placeholder="Nom commande"
              autoFocus={true}
              placeholderTextColor="#a2a2a9"
              value={commandeName}
              onChangeText={setCommandeName}
            />

            <Text style={styles.descInput}>Description de la commande</Text>
            <TextInput
              style={styles.inputDesc}
              keyboardType="default"
              placeholder="Description commande"
              placeholderTextColor="#a2a2a9"
              multiline
              numberOfLines={4}
              maxLength={40}
              value={description}
              onChangeText={setDescription}
            />

<Text style={styles.descInput}>Date de livraison impérative</Text>
            <View style={styles.datePickerContainer}>
              <Button 
                title={"Sélectionner une date"} 
                onPress={() => setShowDatePicker(true) } 
              />
              
              {showDatePicker && (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={showDatePicker}
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.datePickerModal}>
                      <DatePicker
                        mode="single"
                        date={date}
                        onChange={(params) => {
                          setDate(params.date);
                          setShowDatePicker(false);
                        }}
                        minDate={dayjs()}
                        headerButtonColor="#45b308"
                        selectedItemColor="#45b308"
                      />
                      <TouchableOpacity
                        style={styles.datePickerCloseButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.datePickerCloseButtonText}>Fermer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              )}
            </View>

            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Produit sélectionné</Text>
                  <Text style={styles.modalText}>Vous avez sélectionné :</Text>
                  <View style={styles.productBox}>
                    <Text style={styles.productText}>{selectedProduct?.key}</Text>
                  </View>
                  <View style={styles.InputModal}>
                    <Text style={styles.txtInput}>Nombre de {selectedProduct?.key}</Text>
                    <TextInput
                      style={styles.inputNB}
                      keyboardType="decimal-pad"
                      placeholder="Nombre"
                      placeholderTextColor="#a2a2a9"
                      value={nombre}
                      onChangeText={setNombre}
                    />
                  </View>

                  <View style={styles.InputModal}>
                    <Text style={styles.txtInput}>Poids en grammes/pièce {selectedProduct?.key}</Text>
                    <TextInput
                      style={styles.inputNB}
                      keyboardType="decimal-pad"
                      placeholder="Poids"
                      placeholderTextColor="#a2a2a9"
                      value={poids}
                      onChangeText={setPoids}
                    />
                  </View>
                  <View style={styles.buttonModal}>
                    <TouchableOpacity 
                      style={styles.modalButtonOK}
                      onPress={() => {
                        if (selectedProduct && poids && nombre) {
                          add_product(selectedProduct.key, poids, nombre);
                        } else {
                          alert("Veuillez remplir tous les champs");
                          
                        }
                      }}
                    >
                      <Text style={styles.modalButtonText}>Ajouter</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.modalButtonAnnul}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalButtonTextAnnul}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <View style={styles.listProduit}>
              <Text style={styles.titleProd}>Sélectionner vos produits</Text>
              <FlatList
                data={produit}
                renderItem={({item}) => (
                  <TouchableOpacity onPress={() => handleProductPress(item)}>
                    <Text style={styles.item}>{item.nom_produit}</Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>

            <Text style={styles.modalTitle}>Produits Sélectionnés: </Text>
            <View style={{marginBottom: 10}}>
              {childViews}
            </View>
          <Text style={{fontSize : 18, fontWeight : "800"}}>Livraison: </Text>
          <Text style={styles.localisationText}>Votre localisation sera utilisée pour obtenir une livraison plus rapide</Text>
          
          <View style={styles.locationButtons}>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={!hasLocationPermission}
            >
              <Text style={styles.locationButtonText}>utilisez votre localisation</Text>
            </TouchableOpacity>
            <Text style={styles.orText}>OU</Text>
            <Text style={styles.tapText}>Tappez sur la pour choisir la localisation</Text>
          </View>
          
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              provider={PROVIDER_GOOGLE}
              showsUserLocation={hasLocationPermission && userLocation !== null}
              showsMyLocationButton={false}
              onPress={handleMapPress}
            >
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  title="Localisation Séléctionné"
                />
              )}
            </MapView>

            <View style={{display: "flex", flexDirection : "row", justifyContent: "space-around", marginTop: 20}}>
            <TouchableOpacity 
                style={{borderRadius: 15, borderWidth: 2, width: 150, alignItems: "center", height: 30}}
                onPress={zoomIn}
              >
                <Image source={require('../assets/Icons/Dark-Plus.png')} />  
              </TouchableOpacity>

              <TouchableOpacity 
                style={{borderRadius: 15, borderWidth: 2, width: 150, alignItems: "center", height: 30}}
                onPress={zoomOut}
              >
                <Image source={require('../assets/Icons/Dark-Moins.png')} />  
              </TouchableOpacity>
            </View>
          {selectedLocation && (
            <Text style={styles.coordinatesText}>
              Localisation sélectionné: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          )}

          </View>
          
          <TouchableOpacity
            style={styles.reponseCommande}
            onPress={handleSubmit}
          >
            <Text style={styles.textButton}>Mettre en ligne</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  datePickerModal: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  datePickerCloseButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#45b308',
    borderRadius: 5,
  },
  datePickerCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  form: {
    marginTop: 20,
  },
  textH1: {
    fontSize: 25,
    marginTop: 20,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descInput: {
    color: "#000",
    marginBottom: 10,
    marginLeft: '10%',
    fontWeight: "500"
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    width: '80%',
    padding: 10,
    color: '#111',
    marginBottom: 20,
    marginTop: 5,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  inputDesc: {
    height: 80,
    borderWidth: 1,
    borderRadius: 5,
    width: '80%',
    padding: 10,
    color: '#111',
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  datePickerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  reponseCommande: {
    backgroundColor: "#45b308",
    padding: 15,
    borderRadius: 15,
    width: 160,
    height: 60,
    marginTop: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  textButton: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  listProduit: {
    minHeight: 140,
    marginTop: 20,
    marginBottom: 30,
    color: "#000",
    borderRadius: 15,
    backgroundColor: "#B8E0FF",
    padding: 15,
  },
  titleProd: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
    color: '#000',
    textAlign: "center"
  },
  item: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    color: '#000',
  },
  localisationText: {
    color: '#000',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  productBox: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  productText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#45b308',
  },
  modalButtonOK: {
    backgroundColor: '#45b308',
    padding: 10,
    borderRadius: 5,
    width: '50%',
    alignItems: 'center',
    marginTop: 15,
  },
  modalButtonAnnul: {
    borderWidth: 3,
    padding: 10,
    borderRadius: 5,
    width: '50%',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 15,
    borderColor: "#c51b18"
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextAnnul: {
    color: '#c51b18',
    fontSize: 16,
    fontWeight: 'bold',
  },
  txtInput: {
    fontSize: 16,
    fontWeight: "400",
    marginTop: 15
  },
  inputNB: {
    width: 190,
    borderColor: "#111",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    color: '#111',
  },
  InputModal: {
    borderColor: "#111"
  },
  buttonModal: {
    display: "flex",
    flexDirection: "row"
  },
  containerProduct: {
    borderRadius: 7,
    backgroundColor: "#75D4F2",
    marginTop: 10,
    padding: 10,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 45,
    textAlign : "center",
    
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationButtons: {
    alignItems: 'center',
    marginTop: 10,
  },
  locationButton: {
    backgroundColor: '#45b308',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  locationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  orText: {
    marginVertical: 5,
    fontWeight: 'bold',
  },
  tapText: {
    marginBottom: 10,
    fontStyle: 'italic',
  },
  coordinatesText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
  },
});

export default Formulaire;  