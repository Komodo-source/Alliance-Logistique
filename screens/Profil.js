import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  Dimensions
} from 'react-native';

import * as fileManager from './util/file-manager.js';
import * as debbug_lib from './util/debbug.js';
import { NavBarData } from './util/UI_navbar.js';
const { width } = Dimensions.get('window');
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    avatar: null
  });
  const [idFourni, SetIdFourni] = useState('');
  const [loading, setLoading] = useState(false);

  const modify_profile = (data) => {
    // TO DO: Modify the profile data based on the received data
    debbug_lib.debbug_log('Load profile from local', 'blue');
    const mappedData = {
      name: (data.nom_client || data.nom_fournisseur || data.name || userData.name || '') + " " + (data.prenom_client || data.prenom_fournisseur || data.firstname || ''),
      email: data.email_client || data.email_fournisseur || userData.email || '',
    };

    // Save profile data if it comes from server
    if (data.nom_client || data.nom_fournisseur) {
      save_profil(data.nom_client || data.nom_fournisseur,
        data.prenom_client || data.prenom_fournisseur);
    }

    setUserData(prev => ({
      ...prev,
      ...mappedData
    }));
  }

  const save_profil = async (nom, prenom) => {
    // TO DO: Save the profile data to the db
    try {
      await fileManager.modify_value_local_storage(
       "name", nom, 'auto.json');

       await fileManager.modify_value_local_storage(
        "firstname", prenom, 'auto.json');

    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  const get_Profile = async () => {
    try {
      debbug_lib.debbug_log('load profile from backend', 'blue');
      const file = await fileManager.read_file('auto.json');
      //console.log("1");

      const response = await fetch('https://backend-logistique-api-latest.onrender.com/get_user_info.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(file)
      });
  //console.log("2");
      const data = await response.json();
      console.log('Data Received:', data);
      SetIdFourni(data.id_fournisseur || '');
  // console.log("3");
      if (data.err) {
        throw new Error('Mauvaise Réponse du serveur');
      }

      modify_profile(data);
      return data;

    } catch (error) {
      console.log('Erreur lors de la récupération des données + ' + error.message);

    }
  };

  const fetchUserData = async () => {
    ///
    //
    // OBSOLETE
    //
    setLoading(true);
    try {
      console.log('test');
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/get_user_info.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

      });
      const data = await response.json();
      console.log("data user: ", data);
      // Mise à jour des données utilisateur
      if (data) {
        setUserData(prevData => ({ ...prevData, ...data }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données utilisateur');
    } finally {
      setLoading(false);
    }
  };

 const handleDisconnect = async () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all user data
              await fileManager.modify_value_local_storage("id", "", 'auto.json');
              await fileManager.modify_value_local_storage("name", "", 'auto.json');
              await fileManager.modify_value_local_storage("firstname", "", 'auto.json');
              await fileManager.modify_value_local_storage("type", "", 'auto.json');
              await fileManager.modify_value_local_storage("stay_loogged", false, 'auto.json');
              //await fileManager.modify_value_local_storage("first_conn", true, 'auto.json');

              debbug_lib.debbug_log('User logged out successfully', 'green');
              navigation.navigate('HomePage');
            } catch (error) {
              console.error('Error during logout:', error);
              debbug_lib.debbug_log('Error during logout: ' + error.message, 'red');
              // Still navigate even if there's an error
              navigation.navigate('HomePage');
            }
          }
        }
      ]
    );
  };

  const loadProfile = async () => {
    try {
      debbug_lib.debbug_log('Loading profile...', 'blue');
      // First, try to read the saved profile from local storage
      const profil_saved = await fileManager.read_file('auto.json');
      console.log('Saved profile:', profil_saved);

      // Check if we have valid name and firstname in local storage
      if (profil_saved && profil_saved.name && profil_saved.firstname &&
          profil_saved.name.trim() !== "" && profil_saved.firstname.trim() !== "") {
        // Use local data
        modify_profile(profil_saved);
        console.log('Using local profile data');
      } else if (profil_saved.id != "") {
        // Fetch from server if local data is not complete
        console.log('Local data incomplete, fetching from server');
        await get_Profile();
      }else{
        debbug_lib.debbug_log('User not logged In', 'blue');
        Alert.alert(
          "Connexion",
          "Vous n'êtes pas connecté. Veuillez vous connecter pour accéder à votre profil.",
          [
            {
              text: "Me Connecter",
              style: "cancel",
              onPress: () => {
                // Logique de déconnexion
                navigation.navigate('Login');
              }
            },
            {
              text: "OK",
              style: "destructive",
              onPress: () => {
                // Logique de déconnexion
                navigation.navigate('Accueil');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // If there's an error reading local file, try to get from server
      await get_Profile();
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const ProfileOption = ({ icon, title, onPress, isDestructive = false }) => (
    <TouchableOpacity
      style={[styles.optionItem, isDestructive && styles.destructiveOption]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        {icon && <Image source={icon} style={styles.optionIcon} />}
        <Text style={[styles.optionText, isDestructive && styles.destructiveText]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.chevron, isDestructive && styles.destructiveText]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header avec profil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                userData.avatar
                  ? { uri: userData.avatar }
                  : require('../assets/Icons/add_photo.png')
              }
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}
            onPress={() => navigation.navigate('ModifProfil')}>
              <Text style={styles.editAvatarText}>✎</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => navigation.navigate('ModifProfil')}
              activeOpacity={0.8}
            >
              <Text style={styles.editProfileText}>Modifier mon profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Paramètres du compte</Text>

          <View style={styles.optionsContainer}>
            <ProfileOption
              title="Modifier mon profil"
              onPress={() => navigation.navigate('ModifProfil')}
            />

            <ProfileOption
              title="Confidentialité"
              onPress={() => navigation.navigate('Confidentialite')}
            />

            <ProfileOption
              title="Sécurité de mes données"
              onPress={() => navigation.navigate('ProtectionDonnee')}
            />

            <ProfileOption
              title="< Debbug >"
              onPress={() => navigation.navigate('DebbugMenu')}
            />

          </View>
        </View>

        {/* Fournisseur actions - clearly pop out like promotion */}
        {!idFourni ? (
          <View style={styles.fournisseurWrap}>
            <Text style={styles.sectionTitle}>Espace fournisseur</Text>
            <View style={styles.fournisseurActions}>
              <TouchableOpacity
                style={[styles.fournisseurCard, styles.fournisseurCardLeft]}
                onPress={() => navigation.navigate('UploadPhoto')}
                activeOpacity={0.85}
              >
                <View style={styles.cardIconWrap}>
                  <FontAwesome6 name="image" size={24} color="#fff" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Ajouter des photos</Text>
                  <Text style={styles.cardSub}>Présentez vos produits</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.fournisseurCard, styles.fournisseurCardRight]}
                onPress={() => navigation.navigate('fournisseur_produit')}
                activeOpacity={0.85}
              >
                <View style={styles.cardIconWrap}>
                  <MaterialCommunityIcons name="basket-plus-outline" size={24} color="#fff" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Ajouter mes produits</Text>
                  <Text style={styles.cardSub}>Gérer votre catalogue</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.Promotion} activeOpacity={0.9}>
              <View style={styles.promoInner}>
                <FontAwesome6 name="money-bill-trend-up" size={26} color="#000" />
                <Text style={styles.promoText}>Promouvoir mes produits</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Section Déconnexion */}
        <View style={styles.logoutSection}>
          <ProfileOption
            title="Se déconnecter"
            onPress={handleDisconnect}
            isDestructive={true}
          />
        </View>
      </ScrollView>

      <NavBarData navigation={navigation} active_page="profil" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Espace pour la navbar
  },

  // Header Profile
  profileHeader: {
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#e9ecef'
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FF8C00',
    width: 34,
    height: 34,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  editAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  editProfileButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#FF8C00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Options Section
  optionsSection: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 12,
    marginLeft: 4,
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
    tintColor: '#6c757d',
  },
  optionText: {
    fontSize: 15,
    color: '#212529',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 20,
    color: '#6c757d',
    fontWeight: '300',
  },
  destructiveOption: {
    borderBottomWidth: 0,
  },
  destructiveText: {
    color: '#dc3545',
  },

  // Fournisseur cards
  fournisseurWrap: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  fournisseurActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  fournisseurCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
  },
  fournisseurCardLeft: {
    backgroundColor: '#FF8C00',
    marginRight: 6,
  },
  fournisseurCardRight: {
    backgroundColor: '#0ea5a4',
    marginLeft: 6,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },

  Promotion: {
    marginTop: 6,
    marginHorizontal: 0,
    backgroundColor: '#f7d00bff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    height : 64,
    justifyContent: 'center'
  },

  promoInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center'
  },
  promoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000'
  },

  // Logout Section
  logoutSection: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  // Navigation Bar (kept as before)
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
  activeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  iconWrapper: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 10,
  },

  activeIconWrapper: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 10,
  },

  activeNavButton: {
    alignItems: 'center',
  },

  activeNavText: {
    color: '#007bff',
    fontWeight: '600',
  },
});

export default Profile;
