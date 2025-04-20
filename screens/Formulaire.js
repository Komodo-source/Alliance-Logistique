import React, {useState} from 'react';
import {Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, Modal, FlatList, View, Button, TouchableOpacity, ScrollView, Image} from 'react-native';
import DatePicker from 'react-native-date-picker';
import TomateImage from '../assets/Icons/Dark-tomato.png';

const Formulaire = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const [poids, setPoids] = useState('');
  const [nombre, setNombre] = useState('');
  const [commandeName, setCommandeName] = useState('');
  const [description, setDescription] = useState('');

  const [childViews, setChildViews] = useState([]);
  const [products, setProducts] = useState([]); // Pour stocker les produits sélectionnés

  const dic_image_name = {
    "tomate": TomateImage
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

  const handleSubmit = () => {
    // Préparer les données à envoyer
    const formData = {
      commandeName,
      description,
      deliveryDate: date.toISOString(),
      products
    };

    // Envoyer les données au serveur
    fetch('https://votre-serveur.com/api/commandes', {
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
      // Réinitialiser le formulaire si nécessaire
      setCommandeName('');
      setDescription('');
      setDate(new Date());
      setProducts([]);
      setChildViews([]);
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la création de la commande');
    });
  };
  
  return (
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
                title="Selectionner une date" 
                onPress={() => setOpen(true)} 
              />
              <Text>Date sélectionnée : {date.toDateString()}</Text>
            </View>
            <DatePicker
              modal
              open={open}
              date={date}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={() => setOpen(false)}
              androidVariant="nativeAndroid"
            />

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
                    <Text style={styles.txtInput}>Poids en grammes {selectedProduct?.key}</Text>
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
                data={[
                  {key: 'Devin'},
                  {key: 'Dan'},
                  {key: 'Dominic'},
                  {key: 'Jackson'},
                  {key: 'James'},
                  {key: 'Joel'},
                  {key: 'John'},
                  {key: 'Jillian'},
                  {key: 'Jimmy'},
                  {key: 'Julie'},
                ]}
                renderItem={({item}) => (
                  <TouchableOpacity onPress={() => handleProductPress(item)}>
                    <Text style={styles.item}>{item.key}</Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>

            <Text style={styles.modalTitle}>Produits Sélectionnés: </Text>
            <View style={{marginBottom: 10}}>
              {childViews}
            </View>
      
            <Text style={styles.localisationText}>Votre localisation sera utilisée pour obtenir une livraison plus rapide</Text>

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
    backgroundColor: '#fff',
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
    fontSize: 20,
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

  containerProduct : {
    borderRadius : 7,
    backgroundColor: "#75D4F2",
    marginTop: 10,
    padding: 10,
  },
  
});

export default Formulaire;