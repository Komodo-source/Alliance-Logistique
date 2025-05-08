import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button,Image, FlatList} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import data from './../assets/data/auto.json'


const Accueil = ({ navigation }) => {
  const [commande, setCommande] = useState([]);

  const fetch_commande = () => {
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
      console.log("Received data:", data);
      if (!data || data.length === 0) {
        console.log("No data received or empty array");
      }
      setCommande(data);
    })
    .catch(error => {
      console.log("Error fetching data:", error);
    });
    
  }

  const renderCommande = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.commandeCard}
        onPress={() => navigation.navigate('detail_Commande', {item})}
      >
        <Text style={{fontSize : 18, fontWeight : "800", marginBottom : 5}}>{item.nom_dmd}</Text>
        <Text style={{fontSize : 15, fontWeight : "300", marginLeft : 15, marginBottom : 5}}>Date de livraison: {item.date_fin}</Text>
        <Text style={{fontSize : 15, fontWeight : "300", marginLeft : 15, marginBottom : 5}}>Temp restant: {item.temp_restant}</Text>
        <Text style={{fontSize : 14, marginLeft : 15, marginBottom : 5}}>Description: {item.desc_dmd}</Text>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    fetch_commande();
  }, []);

  return (
    <View style={styles.container}>


      <View style={styles.navbar}> 
        <TouchableOpacity 
          style={styles.navButton}
          //onPress={() => console.log('Recherche pressé')}
          //onPress={() => navigation.navigate('HomePage')}
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
          //onPress={() => console.log('Accueil pressé')}
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
          //onPress={() => console.log('Hub pressé')}
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
          //onPress={() => console.log('Profil pressé')}
          onPress={() => navigation.navigate('Profil')}
        >
          <Text style={styles.navButtonText}>Profil</Text>
          <Image
              style={styles.logoNavBar}
              source={require('../assets/Icons/Dark-profile.png')}
            />
        </TouchableOpacity>
      </View>

      <View>
      <TouchableOpacity 

          style={styles.navButton}
          //onPress={() => console.log('Hub pressé')}
          onPress={() => navigation.navigate('Formulaire')}>
              <Text style={{fontSize : 20, fontWeight : "800", marginLeft : 15, marginBottom : 5}}>Passer une commande</Text>
          </TouchableOpacity>

        <Text style={{fontSize : 21, fontWeight : "800", marginLeft : 15, marginBottom : 5}}>Vos commandes: </Text>
        </View>
              {/*ici qu'il ya la liste des commandes*/}
         <View style={styles.commandeBox}>
         <View>
            {commande.length !== 0 ? (
              <FlatList
                data={[commande]}
                renderItem={renderCommande}
                keyExtractor={(item) => item.id_dmd.toString()}
              />
            ) : (
              <View>
                <Text style={{fontSize : 18, fontWeight : "600", marginBottom : 5, textAlign : "center", marginTop : 20}}>Vous n'avez passé aucune commande pour le moment</Text>
                  <TouchableOpacity 
                    style={styles.NvCommande}
                    onPress={() => navigation.navigate('Formulaire')}>
                    <Text style={{color : "#fff", fontSize : 18, fontWeight : "600"}}>Passer une commande</Text>
                </TouchableOpacity>
            </View>
            )}
          </View>

        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commandeBox: {
    height: 500, // Test with fixed height
    marginBottom: 80,
    marginTop: 20,
  },
  commandeCard: {
    backgroundColor: 'lightblue', // Temporary bright color
    height: 100, // Fixed height for testing
    width: '100%', // Full width
    marginTop: 20,
  },
  productGrid: {
    padding: 10,
    paddingBottom: 80, 
  },
  logoNavBar: {
    width: 30,
    height: 30,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
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
  NvCommande: {
    height: 40,
    borderRadius: 7,
    width: '80%',
    backgroundColor: '#000',
    alignSelf: 'center',
    marginTop: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commandeBox: {
    flex: 1,
    marginBottom: 80, // Add space for the navbar
  },
  commandeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
    minWidth: '45%',
  },
});

export default Accueil;