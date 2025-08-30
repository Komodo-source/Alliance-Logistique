import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from 'react-native';

const ProfilPublic = ({ route }) => {
  const { id } = route.params;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    try {
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/get_user_info.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: id })
      });

      const data = await response.json();
      setUserData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load profile.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileCard}>
          {userData.type === "fournisseur" && (
            <Image
              style={styles.profileImage}
              source={{
                uri: 'https://via.placeholder.com/150', // Placeholder image for suppliers
              }}
            />
          )}
          <Text style={styles.name}>
            {userData.nom_client || userData.nom_fournisseur || userData.nom_coursier} {userData.prenom_client || userData.prenom_fournisseur || userData.prenom_coursier}
          </Text>
          <Text style={styles.subText}>
            {userData.nom_orga ? `${userData.nom_orga}, ${userData.ville_organisation}` : ''}
          </Text>
          {userData.type === "client" && (
            <Text style={styles.infoText}>Number of Orders: {userData.nb_commande}</Text>
          )}
          {userData.type === "fournisseur" && (
            <>
              <Text style={styles.infoText}>Number of Products Supplied: {userData.nb_produit_fourni}</Text>
              <Text style={styles.infoText}>Average Product Price: {userData.prix_produit}€</Text>
            </>
          )}
          {userData.type === "coursier" && (
            <Text style={styles.infoText}>Phone: {userData.telephone_coursier}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    width: Dimensions.get('window').width * 0.9,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default ProfilPublic;