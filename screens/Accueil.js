import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Image, FlatList, Dimensions, ScrollView } from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
//import data from './../assets/data/auto.json'
import * as FileSystem from 'expo-file-system';
import CarouselCards from './sub_screens/CarouselCards';
import * as FileManager from './util/file-manager.js';
const { width } = Dimensions.get('window');

const Accueil = ({ navigation }) => {
  const [commande, setCommande] = useState([]);
  const data = FileManager.read_file("auto.json")

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
      
      if (error instanceof SyntaxError) {
        console.error('Failed to parse JSON - file may be corrupted');
      } else if (error.code === 'ENOENT') {
        console.error('File not found - path may be incorrect');
      }
      
      return null;
    }
  };

  const fetch_commande = () => {
    readProductFile();
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
      data = data.slice(0,3); // Show more orders on homepage
      console.log("Received data:", data);
      if (!data || data.length === 0) {
        console.log("No data received or empty array");
        setCommande([]); 
      } else {
        setCommande(data); 
      }
    })
    .catch(error => {
      console.log("Error fetching data:", error);
      setCommande([]);
    });
  }

  // Quick action items for professional users
  const quickActions = [
    {
      id: 1,
      title: "Nouvelle Commande",
      subtitle: "Passer une commande",
      icon: "📋",
      color: "#4CAF50",
      action: () => navigation.navigate('Formulaire')
    },
    {
      id: 2,
      title: "Commandes Récurrentes",
      subtitle: "Gérer vos commandes",
      icon: "🔄",
      color: "#2196F3",
      action: () => navigation.navigate('Hub')
    },
    {
      id: 3,
      title: "Catalogue",
      subtitle: "Parcourir les produits",
      icon: "📚",
      color: "#FF9800",
      action: () => navigation.navigate('Produit')
    },
    {
      id: 4,
      title: "Factures",
      subtitle: "Gérer la comptabilité",
      icon: "💰",
      color: "#9C27B0",
      action: () => navigation.navigate('Profil')
    }
  ];

  const renderQuickAction = ({ item }) => (
    <TouchableOpacity 
      style={[styles.quickActionCard, { backgroundColor: item.color }]}
      onPress={item.action}
    >
      <Text style={styles.quickActionIcon}>{item.icon}</Text>
      <Text style={styles.quickActionTitle}>{item.title}</Text>
      <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
    </TouchableOpacity>
  );

  const renderCommande = ({item}) => {
    const getStatusColor = (status) => {
      // Assuming status logic based on dates or status field
      return "#4CAF50"; // Default green for active orders
    };

    return (
      <TouchableOpacity
        style={styles.commandeCard}
        onPress={() => navigation.navigate('detail_Commande', {item})}
      >
        <View style={styles.commandeHeader}>
          <View style={styles.commandeInfo}>
            <Text style={styles.commandeName}>{item.nom_dmd}</Text>
            <Text style={styles.commandeNumber}>#{item.id_public_cmd}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>En cours</Text>
          </View>
        </View>
        
        <View style={styles.commandeDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Livraison:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.date_fin).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    fetch_commande();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Bonjour!</Text>
            <Text style={styles.businessName}>Votre Hub Professionnel</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: action.color }]}
                onPress={action.action}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Commandes Récentes</Text>
            {commande.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Hub')}>
                <Text style={styles.seeAllText}>Voir tout →</Text>
              </TouchableOpacity>
            )}
          </View>

          {commande && commande.length > 0 ? (
            <FlatList
              data={commande}
              renderItem={renderCommande}
              keyExtractor={(item) => item.id_dmd.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>Aucune commande récente</Text>
              <Text style={styles.emptyStateDescription}>
                Commencez par passer votre première commande
              </Text>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Formulaire')}
              >
                <Text style={styles.primaryButtonText}>Passer une commande</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Control Panel Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tableau de Bord</Text>
          <View style={styles.carouselContainer}>
            <CarouselCards />
          </View>
        </View>

        {/* Business Stats or Promotions */}
        <View style={styles.section}>
          <View style={styles.promoCard}>
            <Text style={styles.promoTitle}>💡 Conseil Pro</Text>
            <Text style={styles.promoText}>
              Programmez vos commandes récurrentes pour économiser jusqu'à 15% sur vos achats réguliers.
            </Text>
            <TouchableOpacity style={styles.promoButton}
              onPress={() => navigation.navigate('commande_reccurente')}
            >
              <Text style={styles.promoButtonText}>En savoir plus</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navbar}> 
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('HomePage')}
        >
          <Image
            style={styles.logoNavBar}
            source={require('../assets/Icons/Dark-Product.png')}
          />
          <Text style={styles.navButtonText}>Produits</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Accueil')}
        >
          <View style={styles.activeButton}>
            <Image
              style={{width: 24, height: 24}}
              source={require('../assets/Icons/Dark-House.png')}
            />
          </View>
          <Text style={[styles.navButtonText, styles.activeNavText]}>Accueil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Hub')}
        >
          <Image
            style={styles.logoNavBar}
            source={require('../assets/Icons/Dark-Hub.png')}
          />
          <Text style={styles.navButtonText}>Commandes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Profil')}
        >
          <Image
            style={styles.logoNavBar}
            source={require('../assets/Icons/Dark-profile.png')}
          />
          <Text style={styles.navButtonText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
    marginBottom: 90,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },

  // Command Cards
  commandeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  commandeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commandeInfo: {
    flex: 1,
  },
  commandeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  commandeNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  commandeDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 10,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Carousel
  carouselContainer: {
    marginTop: 10,
  },

  // Promo Card
  promoCard: {
    backgroundColor: '#FFF8E1',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    marginBottom: 30
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  promoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  promoButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFC107',
    borderRadius: 6,
  },
  promoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // Bottom Navigation
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  activeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#2196F3',
  },
  logoNavBar: {
    width: 24,
    height: 24,
  },
});

export default Accueil;