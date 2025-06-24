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
const { width } = Dimensions.get('window');

const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    avatar: null
  });
  const [loading, setLoading] = useState(false);

  const modify_profile = (data) => {
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
      //console.log("File: ", file);  
      
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/get_user_info.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(file)
      });
  
      const data = await response.json();
      console.log('Data Received:', data);
  
      if (data.err) {
        throw new Error('Mauvaise Réponse du serveur');
      }
  
      modify_profile(data);
      return data;
  
    } catch (error) {
      console.log('Erreur lors de la récupération des données');
      console.error('Erreur lors de la récupération des données', error);
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

  const handleDisconnect = () => {
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
          onPress: () => {
            // Logique de déconnexion
            navigation.navigate('Login');
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
            <TouchableOpacity style={styles.editAvatarButton}>
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
              onPress={() => navigation.navigate('Confidentialité')}
            />
            
            <ProfileOption
              title="Sécurité de mes données"
              onPress={() => navigation.navigate('Sécurité')}
            />
            
            <ProfileOption
              title="Notifications"
              onPress={() => navigation.navigate('Notifications')}
            />
            
            <ProfileOption
              title="Aide et support"
              onPress={() => navigation.navigate('Support')}
            />
          </View>
        </View>

        {/* Section Déconnexion */}
        <View style={styles.logoutSection}>
          <ProfileOption
            title="Se déconnecter"
            onPress={handleDisconnect}
            isDestructive={true}
          />
        </View>
      </ScrollView>

      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Produit')}
          activeOpacity={0.7}
        >
          <Image
            style={styles.navIcon}
            source={require('../assets/Icons/Dark-Product.png')}
          />
          <Text style={styles.navButtonText}>Produit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Accueil')}
          activeOpacity={0.7}
        >
          <Image
            style={styles.navIcon}
            source={require('../assets/Icons/Dark-House.png')}
          />
          <Text style={styles.navButtonText}>Accueil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Hub')}
          activeOpacity={0.7}
        >
          <Image
            style={styles.navIcon}
            source={require('../assets/Icons/Dark-Hub.png')}
          />
          <Text style={styles.navButtonText}>Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, styles.activeNavButton]}
          onPress={() => navigation.navigate('Profil')}
          activeOpacity={0.7}
        >
          <View style={styles.activeButtonIndicator}>
            <Image
              style={styles.navIcon}
              source={require('../assets/Icons/Dark-profile.png')}
            />
          </View>
          <Text style={[styles.navButtonText, styles.activeNavText]}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Espace pour la navbar
  },
  
  // Header Profile
  profileHeader: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#e9ecef',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007bff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
  },
  editProfileButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Options Section
  optionsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
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
    width: 24,
    height: 24,
    marginRight: 12,
    tintColor: '#6c757d',
  },
  optionText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
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

  // Logout Section
  logoutSection: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },

  // Navigation Bar
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavButton: {},
  navIcon: {
    width: 28,
    height: 28,
    marginBottom: 4,
    tintColor: '#6c757d',
  },
  activeButtonIndicator: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeNavText: {
    color: '#007bff',
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