import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button,Image, SafeAreaView, FlatList} from 'react-native';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};


//TODO mettre un écran de chargement

const Hub = ({ navigation }) => {

  function slice_description(desc){
    //on pourra le modifier pour ajouter un couper où il y a un espace
    return desc.slice(0, 75) + "..."
  }
  const [HUB, setHub] = useState([]); // nom table ici aussi
  
  useEffect(() => {
    fetch('https://backend-logistique-api-latest.onrender.com/api.php')
      .then((response) => response.json())
      .then((data) => setHub(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <View style={styles.container}>
      

          <View>
            <Text style={styles.titleGeneral}>Dernière commande en date: </Text>
            <FlatList
              data={HUB} //nom de la table 
              keyExtractor={(item) => item.id_dmd.toString()} //id utilisé
              renderItem={({item}) => (
                console.log(item),
                <TouchableOpacity
                  style={styles.commandeContainer}
                  onPress={() => navigation.navigate('Details', { data: item})}
                >
                  <Text style={styles.textCommande}>{item.nom_dmd}</Text>
                  <Text style={styles.descCommande}>{slice_description(item.desc_dmd)}</Text>
                  <Text style={styles.dateCommande}>date livraison {item.date_fin}</Text>
                  <View style={styles.redirectionCommande}>
                    <Image
                      style={styles.logoNavBar}
                      source={require('../assets/Icons/Dark-continue.png')}
                    />
                  </View>
                </TouchableOpacity>
              )}
            >

            </FlatList>
          </View>

          <View style={styles.navbar}> 
                  <TouchableOpacity 
                    style={styles.navButton}
                    //onPress={() => console.log('Recherche pressé')}
                    onPress={() => navigation.navigate('HomePage')}
                  >
                    <Text style={styles.navButtonText}>HomePage</Text>
                  </TouchableOpacity>
          
          
                  <TouchableOpacity 
                    style={styles.navButton}
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
                    style={[styles.navButton,styles.activeButton]}
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
    </View>
  );
};


const styles = StyleSheet.create({
  logoNavBar: {
    width: 30,
    height: 30,
  },

  //NAVBAR style
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

  
  titleGeneral : {
    fontSize: 22,
    fontWeight: "bold"
  },
  //STYLE COMMANDE

  commandeContainer : {
    borderRadius: 15,
    marginTop: 35,
    backgroundColor: "#8789C0",
    padding: 20,
  },

  textCommande : {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 15,
  },

  descCommande : {
    fontSize: 16,
    marginBottom: 10
  },

  dateCommande : {
    marginLeft: 15,
    color: "#2b2b29"
  },

  redirectionCommande : {
    display: "flex",
    alignItems: "flex-end"
  }

});

export default Hub;