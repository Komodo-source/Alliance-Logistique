import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Image, FlatList, Alert, ScrollView, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as FileManager from './util/file-manager.js';

const { width, height } = Dimensions.get('window');

const Hub = ({ navigation }) => {
  const [commande, setCommande] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const data = await FileManager.read_file("auto.json");
        setIsClient(data?.type === "cli");
      } catch (error) {
        console.error("Error reading user type:", error);
        setIsClient(false);
      }
    };
    checkUserType();
  }, []);

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

  const fetch_commande = async () => {
    try {
      setLoading(true);
      const data = await FileManager.read_file("auto.json");
      if (!data) {
        setCommande([]);
        setLoading(false);
        return;
      }
      setUserData(data);
      const session_id = data.session_id;

      const response = await fetch('https://backend-logistique-api-latest.onrender.com/recup_commande_cli.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({session_id})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Commandes récupérées:", responseData);
      setCommande(Array.isArray(responseData) ? responseData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching commands:", error);
      setCommande([]);
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'En préparation': case 'En préparation': return '#FF9500';
      case 'Livré': case 'Livré': case 'livré': return '#34D399';
      case 'cancelled': case 'annulé': return '#EF4444';
      case 'En cours de livraison': case 'En cours de livraison': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusEquivalent =  {
      1 : 'En préparation',
      2 : 'En cours de livraison',
      3 : 'Livré',
      4 : 'Annulé',

  }

  const getStatusText = (status) => {
    switch(status) {
      case 'En préparation': case 'En préparation': return 'En attente';
      case 'Livré': case 'Livré': case 'livré': return 'Livré';
      case 'annulé': case 'annulé': return 'Annulé';
      case 'En cours de livraison': case 'En cours de livraison': return 'En cours';
      default: return 'Statut inconnu';
    }
  };

  const filteredCommandes = commande.filter(item => {
    if (filter === 'all') return true;

    const statusMap = {
      'En préparation': 1,
      'En cours de livraison': 2,
      'Livré': 3,
      'annulé': 4
    };

    return item.id_status === statusMap[filter];
  });

  const renderCommande = ({item, index}) => {
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

    const statusColor = getStatusColor(getStatusEquivalent[item.id_status]);
    const statusText = getStatusEquivalent[item.id_status];
    //console.log(getStatusEquivalent[item.id_status])
    //console.log("Status text:", statusText, "Color:", statusColor);

    return (
      <TouchableOpacity
        style={[styles.commandeCard, {
          transform: [{ scale: 1 }],
          opacity: 1
        }]}
        onPress={handlePress}
        activeOpacity={0.95}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.nom_dmd || `Commande #${index + 1}`}
            </Text>
            <Text style={styles.commandeId}>
              #{item.id_public_cmd || 'N/A'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="calendar" size={20} color="#64748B" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Livraison prévue</Text>
              <Text style={styles.infoValue}>
                {item.date_fin ? new Date(item.date_fin).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'Non définie'}
              </Text>
            </View>
          </View>

          {item.desc_dmd && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="text" size={20} color="#64748B" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Description</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {item.desc_dmd}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.productsSection}>
            <View style={styles.productHeader}>
              <Text style={styles.productHeaderText}>
                <MaterialCommunityIcons name="package-variant" size={18} color="#1E293B" /> Produits ({item.produits?.length || 0})
              </Text>
            </View>
            <View style={styles.productsList}>
              {item.produits && Array.isArray(item.produits) && item.produits.slice(0, 3).map((produit, prodIndex) => (
                <View key={prodIndex} style={styles.productItem}>
                  <View style={styles.productDot} />
                  <Text style={styles.productText} numberOfLines={1}>
                    {produit.nom_produit || 'Produit'}
                    <Text style={styles.productQuantity}>
                      {' '}× {produit.quantite || 1} {produit.type_vendu || ''}
                    </Text>
                  </Text>
                </View>
              ))}
              {item.produits && item.produits.length > 3 && (
                <Text style={styles.moreProductsText}>
                  +{item.produits.length - 3} autres produits...
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.viewDetailsButton} onPress={handlePress}>
            <Text style={styles.viewDetailsText}>Voir détails</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const renderFilterButton = (filterType, label, iconName) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.activeFilterButton
      ]}
      onPress={() => setFilter(filterType)}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={16}
        color={filter === filterType ? '#FFFFFF' : '#64748B'}
        style={styles.filterIcon}
      />
      <Text style={[
        styles.filterText,
        filter === filterType && styles.activeFilterText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <MaterialCommunityIcons name="package-variant" size={40} color="#64748B" />
      </View>
      <Text style={styles.emptyStateTitle}>
        {filter === 'all' ? 'Aucune commande' : 'Aucune commande dans cette catégorie'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {filter === 'all'
          ? 'Vous n\'avez passé aucune commande pour le moment'
          : 'Essayez de changer le filtre pour voir d\'autres commandes'
        }
      </Text>
      {isClient && filter === 'all' && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={() => {
            try {
              navigation.navigate('Formulaire');
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }}>
          <Text style={styles.emptyStateButtonText}>Passer ma première commande</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  useEffect(() => {
    fetch_commande();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with gradient background */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mes Commandes</Text>
          <Text style={styles.headerSubtitle}>
            {userData !== null ? userData.firstname + " " + userData.name : 'Utilisateur'} • {commande.length} commande{commande.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => {
              try {
                navigation.navigate('commande_reccurente');
              } catch (error) {
                console.error("Navigation error:", error);
              }
            }}>
            <View style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="repeat" size={28} color="#3B82F6" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Commandes récurrentes</Text>
              <Text style={styles.quickActionSubtitle}>Gérer vos abonnements</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filtersSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {renderFilterButton('all', 'Toutes', 'clipboard-text')}
            {renderFilterButton('En préparation', 'En attente', 'clock')}
            {renderFilterButton('En cours de livraison', 'En cours', 'truck-delivery')}
            {renderFilterButton('Livré', 'Livrées', 'check-circle')}
            {renderFilterButton('annulé', 'Annulées', 'close-circle')}

          </ScrollView>

        </View>

        {/* Commands List */}
        <View style={styles.commandsSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner}>
                <MaterialCommunityIcons name="loading" size={30} color="#3B82F6" />
              </View>
              <Text style={styles.loadingText}>Chargement de vos commandes...</Text>
            </View>
          ) : filteredCommandes.length > 0 ? (
            <FlatList
              data={filteredCommandes}
              renderItem={renderCommande}
              keyExtractor={(item) => item.id_dmd?.toString() || Math.random().toString()}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />
          ) : (
            <EmptyState />
          )}
        </View>

        {/* Floating Action Button */}
        {isClient && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              try {
                navigation.navigate('Formulaire');
              } catch (error) {
                console.error("Navigation error:", error);
              }
            }}>
            <MaterialCommunityIcons name="plus" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Navigation Bar */}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 30,
    paddingVertical: 24,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
    letterSpacing: -0.5,
    textAlign: "center"
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(7, 7, 7, 0.8)',
    fontWeight: '500',
    textAlign: "center"
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filtersSection: {
    paddingVertical: 8,
  },
  filtersContainer: {
    paddingHorizontal: 10,
    gap: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  commandsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  flatListContent: {
    paddingBottom: 120,
  },
  itemSeparator: {
    height: 12,
  },
  commandeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#FAFBFC',
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  commandeId: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 20,
    paddingTop: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
    lineHeight: 20,
  },
  productsSection: {
    marginTop: 8,
  },
  productHeader: {
    marginBottom: 12,
  },
  productHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  productsList: {
    gap: 8,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: 10,
  },
  productText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  productQuantity: {
    fontWeight: '700',
    color: '#1E293B',
  },
  moreProductsText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
    marginLeft: 16,
    marginTop: 4,
  },
  cardFooter: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    backgroundColor: '#3B82F6',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
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
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoNavBar: {
    width: 28,
    height: 28,
    marginBottom: 2,
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
  activeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
export default Hub;
