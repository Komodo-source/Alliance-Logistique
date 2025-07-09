import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Image, FlatList, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
//import data from './../assets/data/auto.json'
import * as FileSystem from 'expo-file-system';
import * as FileManager from './util/file-manager.js';

const Hub = ({ navigation }) => {
  const [commande, setCommande] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const fetch_commande = async () => {
    try {
      setLoading(true);
      const data = await FileManager.read_file("auto.json");
      if (!data || !data.id) {
        setCommande([]);
        setLoading(false);
        return;
      }
      setUserData(data);
      const id_client = data.id;
      
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/recup_commande_cli.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id_client})
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      setCommande(Array.isArray(responseData) ? responseData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching commands:", error);
      setCommande([]);
      setLoading(false);
    }
  }

  const renderCommande = ({item}) => {
    if (!item) return null;
    
    const handlePress = () => {
      try {
        if (navigation && navigation.navigate) {
          navigation.navigate('detail_Commande', {item});
        }
      } catch (error) {
        console.error("Navigation error:", error);
        Alert.alert('Erreur', 'Impossible d\'ouvrir les détails de la commande');
      }
    };
    
    return (
      <TouchableOpacity
        style={styles.commandeCard}
        onPress={handlePress}
      >
        <Text style={{fontSize: 18, fontWeight: "800", marginBottom: 5}}>
          {item.nom_dmd || 'Commande sans nom'}
        </Text>
        <Text style={{fontSize: 15, fontWeight: "300", marginLeft: 15, marginBottom: 5}}>
          Date de livraison: {item.date_fin ? new Date(item.date_fin).toLocaleDateString() : 'Non définie'}
        </Text>
        <Text style={{fontSize: 14, marginLeft: 15, marginBottom: 5}}>
          Description: {item.desc_dmd || 'Aucune description'}
        </Text>
        <Text style={{fontSize: 14, marginLeft: 15, marginBottom: 5}}>
          Numéro de commande: {item.id_public_cmd || 'N/A'}
        </Text>
        <View style={{marginLeft: 15, marginTop: 5}}>
          <Text style={{fontSize: 14, fontWeight: "600", marginBottom: 3}}>Produits:</Text>
          {item.produits && Array.isArray(item.produits) && item.produits.map((produit, index) => (
            <Text key={index} style={{fontSize: 13, marginLeft: 10}}>
              • {produit.nom_produit || 'Produit'} - {produit.quantite || 1} {produit.type_vendu || ''}
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    fetch_commande();
  }, []);

  return (
    <SafeAreaView style={{flex:1, backgroundColor:'#F4F7FA'}}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Mes Commandes</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commandes récurrentes</Text>
          <TouchableOpacity
            style={styles.comRecButton}
            onPress={() => {
              try {
                navigation.navigate('commande_reccurente');
              } catch (error) {
                console.error("Navigation error:", error);
              }
            }}>
            <Text style={styles.comRecButtonText}>Voir mes commandes récurrentes {'>'}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.section, {flex:1}]}> {/* Make this section take available space */}
          <Text style={styles.sectionTitle}>Vos commandes</Text>
          <View style={[styles.commandeBox, {flex:1}]}> {/* Make this box take available space */}
            {loading ? (
              <Text style={{textAlign:'center', marginTop:20}}>Chargement...</Text>
            ) : commande && commande.length > 0 ? (
              <FlatList
                data={commande}
                renderItem={renderCommande}
                keyExtractor={(item) => item.id_dmd?.toString() || Math.random().toString()}
                contentContainerStyle={{paddingBottom: 100}}
                style={{flex:1}}
              />
            ) : (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateText}>
                  Vous n'avez passé aucune commande pour le moment
                </Text>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => {
                    try {
                      navigation.navigate('Formulaire');
                    } catch (error) {
                      console.error("Navigation error:", error);
                    }
                  }}>
                  <Text style={styles.primaryButtonText}>Passer une commande</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => {
            try {
              navigation.navigate('Formulaire');
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }}>
          <Image source={require('../assets/Icons/Light-commande.png')} style={styles.fabIcon}/>
        </TouchableOpacity>
        <View style={styles.navbar}> 
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              try {
                navigation.navigate('Produit');
              } catch (error) {
                console.error("Navigation error:", error);
              }
            }}
          >
            <Image style={styles.logoNavBar} source={require('../assets/Icons/Dark-Product.png')} />
            <Text style={styles.navButtonText}>Produit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              try {
                navigation.navigate('Accueil');
              } catch (error) {
                console.error("Navigation error:", error);
              }
            }}
          >
            <Image style={styles.logoNavBar} source={require('../assets/Icons/Dark-House.png')} />
            <Text style={styles.navButtonText}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, styles.activeButton]}
            onPress={() => {
              try {
                navigation.navigate('Hub');
              } catch (error) {
                console.error("Navigation error:", error);
              }
            }}
          >
            <Image style={[styles.logoNavBar, styles.activeIcon]} source={require('../assets/Icons/Dark-Hub.png')} />
            <Text style={[styles.navButtonText, styles.activeText]}>Hub</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              try {
                navigation.navigate('Profil');
              } catch (error) {
                console.error("Navigation error:", error);
              }
            }}
          >
            <Image style={styles.logoNavBar} source={require('../assets/Icons/Dark-profile.png')} />
            <Text style={styles.navButtonText}>Profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E3192',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
    marginLeft: 4,
  },
  commandeBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  commandeCard: {
    backgroundColor: '#EAF1FB',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyStateBox: {
    alignItems: 'center',
    marginTop: 30,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#888',
    marginBottom: 18,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#2E3192',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2E3192',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 90,
    backgroundColor: '#2E3192',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E3192',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  fabIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  comRecButton: {
    backgroundColor: '#7CC6FE',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
    shadowColor: '#7CC6FE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  comRecButtonText: {
    color: '#2E3192',
    fontWeight: '700',
    fontSize: 15,
  },
  logoNavBar: {
    width: 28,
    height: 28,
    marginBottom: 2,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  activeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    minHeight: 60,
  },
  
  activeButton: {
    backgroundColor: '#7CC6FE',
    shadowColor: '#7CC6FE',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  iconContainer: {
    marginBottom: 4,
    padding: 2,
  },
  
  logoNavBar: {
    width: 24,
    height: 24,
    tintColor: '#666666',
  },
  
  activeIcon: {
    tintColor: '#FFFFFF',
    width: 26,
    height: 26,
  },
  
  navButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
});

export default Hub;