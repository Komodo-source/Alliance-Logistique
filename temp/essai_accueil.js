import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import data from './../assets/data/auto.json';
import * as FileSystem from 'expo-file-system';
import CarouselCards from './sub_screens/CarouselCards';

const Accueil = ({ navigation }) => {
  const [commande, setCommande] = useState([]);
  const [quickActions] = useState([
    { id: '1', title: 'Nouvelle commande', emoji: '📦', screen: 'Formulaire' },
    { id: '2', title: 'Historique', emoji: '📋', screen: 'Hub' },
    { id: '3', title: 'Produits', emoji: '🍕', screen: 'HomePage' },
    { id: '4', title: 'Statistiques', emoji: '📊', screen: 'Stats' },
  ]);

  const readProductFile = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + 'product.json';
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) return null;
      const fileContents = await FileSystem.readAsStringAsync(fileUri);
      return JSON.parse(fileContents);
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id_client})
    })
    .then(response => response.json())
    .then(data => {
      data = data.slice(0,2);
      setCommande(data || []); 
    })
    .catch(error => {
      console.log("Error fetching data:", error);
      setCommande([]);
    });
  }

  const renderCommande = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.commandeCard}
        onPress={() => navigation.navigate('detail_Commande', {item})}
      >
        <View style={styles.commandeHeader}>
          <Text style={styles.commandeId}>#{item.id_public_cmd}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.commandeStatus}>En cours</Text>
          </View>
        </View>
        <Text style={styles.commandeName}>{item.nom_dmd}</Text>
        <Text style={styles.commandeDate}>
          Livraison prévue: {new Date(item.date_fin).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    )
  }

  const renderQuickAction = ({item}) => (
    <TouchableOpacity 
      style={styles.quickAction}
      onPress={() => navigation.navigate(item.screen)}
    >
      <Text style={styles.quickActionEmoji}>{item.emoji}</Text>
      <Text style={styles.quickActionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    fetch_commande();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.businessName}>Votre Établissement</Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.quickActionsContainer}
          />
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Commandes récentes</Text>
            {commande.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Hub')}>
                <Text style={styles.seeAll}>Voir tout</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {commande.length > 0 ? (
            <FlatList
              data={commande}
              renderItem={renderCommande}
              keyExtractor={(item) => item.id_dmd.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Text style={{fontSize: 40}}>🛒</Text>
              </View>
              <Text style={styles.emptyText}>Aucune commande récente</Text>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Formulaire')}>
                <Text style={styles.primaryButtonText}>Passer une commande</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos statistiques</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Commandes ce mois</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>3,450€</Text>
              <Text style={styles.statLabel}>Chiffre d'affaires</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navbar}> 
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('HomePage')}
        >
          <Text style={styles.navIcon}>🍕</Text>
          <Text style={styles.navButtonText}>Produit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, styles.activeNavButton]}
          onPress={() => navigation.navigate('Accueil')}
        >
          <Text style={[styles.navIcon, styles.activeNavIcon]}>🏠</Text>
          <Text style={[styles.navButtonText, styles.activeNavText]}>Accueil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Hub')}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navButtonText}>Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Profil')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navButtonText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6EE',
  },
  scrollView: {
    flex: 1,
    marginBottom: 70,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '300',
    color: '#2c3e50',
  },
  businessName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
  },
  section: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  seeAll: {
    fontSize: 14,
    color: '#2E3192',
    fontWeight: '600',
  },
  quickActionsContainer: {
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  commandeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  commandeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commandeId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  statusBadge: {
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  commandeStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e67e22',
  },
  commandeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5,
  },
  commandeDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#2E3192',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
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
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  navButton: {
    alignItems: 'center',
    padding: 5,
  },
  activeNavButton: {
    // Style for active button if needed
  },
  activeNavText: {
    color: '#2E3192',
    fontWeight: '700',
  },
  activeNavIcon: {
    color: '#2E3192',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  navButtonText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default Accueil;