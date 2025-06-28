import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import data from './../assets/data/auto.json';
import * as FileSystem from 'expo-file-system';
import CarouselCards from './sub_screens/CarouselCards';

const Accueil = ({ navigation }) => {
  const [commande, setCommande] = useState([]);

  const readProductFile = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + 'product.json';
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) return null;

      const fileContents = await FileSystem.readAsStringAsync(fileUri);
      const parsedData = JSON.parse(fileContents);
      return parsedData;
    } catch (error) {
      console.error('Error reading product.json:', error);
      return null;
    }
  };

  const fetch_commande = () => {
    readProductFile();
    const id_client = data.id;
    fetch('https://backend-logistique-api-latest.onrender.com/recup_commande_cli.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_client }),
    })
      .then((response) => response.json())
      .then((data) => {
        const commandes = data.slice(0, 2);
        setCommande(commandes);
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
        setCommande([]);
      });
  };

  const renderCommande = ({ item }) => (
    <TouchableOpacity
      style={styles.commandeCard}
      onPress={() => navigation.navigate('detail_Commande', { item })}
    >
      <Text style={styles.commandeTitleText}>{item.nom_dmd}</Text>
      <Text style={styles.commandeSubText}>
        Date de livraison: {new Date(item.date_fin).toLocaleDateString()}
      </Text>
      <Text style={styles.commandeSubText}>
        Numéro de commande: {item.id_public_cmd}
      </Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    fetch_commande();
  }, []);

  const QuickButton = ({ label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickButton}>
      <View style={styles.quickButtonBox}>
        <Text style={styles.quickButtonText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue 👋</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Formulaire')}
          >
            <Text style={styles.primaryButtonText}>Passer une commande</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickButton label="Commandes" onPress={() => navigation.navigate('Hub')} />
          <QuickButton label="Historique" onPress={() => {}} />
          <QuickButton label="Support" onPress={() => {}} />
        </View>

        {/* Commandes récentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commandes récentes</Text>
          {commande.length > 0 ? (
            <>
              <FlatList
                data={commande}
                renderItem={renderCommande}
                keyExtractor={(item) => item.id_dmd.toString()}
              />
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Hub')}
              >
                <Text style={styles.secondaryButtonText}>Voir toutes les commandes</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.emptyText}>Aucune commande récente</Text>
          )}
        </View>

        {/* Control Panels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Panneaux de contrôle</Text>
          <CarouselCards />
        </View>

      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('HomePage')}>
          <Image style={styles.logoNavBar} source={require('../assets/Icons/Dark-Product.png')} />
          <Text style={styles.navButtonText}>Produit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Accueil')}>
          <View style={styles.activeButton}>
            <Image style={styles.logoActive} source={require('../assets/Icons/Dark-House.png')} />
          </View>
          <Text style={styles.navButtonText}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Hub')}>
          <Image style={styles.logoNavBar} source={require('../assets/Icons/Dark-Hub.png')} />
          <Text style={styles.navButtonText}>Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profil')}>
          <Image style={styles.logoNavBar} source={require('../assets/Icons/Dark-profile.png')} />
          <Text style={styles.navButtonText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6EE' },
  scrollViewContent: { paddingBottom: 120 },

  // Header
  header: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#2c3e50', marginBottom: 15 },
  primaryButton: {
    backgroundColor: '#2E3192',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 20,
  },
  quickButton: { alignItems: 'center' },
  quickButtonBox: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 10,
    minWidth: 90,
  },
  quickButtonText: { fontWeight: '600', textAlign: 'center' },

  // Section Titles
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
  },

  // Commandes
  commandeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commandeTitleText: { fontSize: 18, fontWeight: '800', color: '#2c3e50', marginBottom: 5 },
  commandeSubText: { fontSize: 14, color: '#2c3e50', marginLeft: 10 },

  secondaryButton: {
    alignSelf: 'center',
    backgroundColor: '#7CC6FE',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  secondaryButtonText: { color: '#000', fontWeight: '600' },
  emptyText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },

  // Bottom Navbar
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
    alignItems: 'center',
  },
  activeButton: {
    borderRadius: 40,
    backgroundColor: '#7CC6FE',
    width: 90,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoActive: { width: 30, height: 30 },
  navButtonText: { fontSize: 16, fontWeight: 'bold' },
  logoNavBar: { width: 30, height: 30, marginBottom: 5 },
});

export default Accueil;
