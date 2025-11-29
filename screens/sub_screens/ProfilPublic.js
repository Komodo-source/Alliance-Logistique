import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import { loadImages } from '../util/ReferenceImage';


const SUPABASE_URL = 'https://nbgfetlejuskutvxvfmd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iZ2ZldGxlanVza3V0dnh2Zm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTI3NTMsImV4cCI6MjA3ODUyODc1M30.pIj8KNWVxzBnhatG4HvqpXB36D4dPO4T8R7E-aShuEI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ProfilPublic = ({ route }) => {
  const { id, type } = route.params; // id is the target_id we need

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Added photo state
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photosError, setPhotosError] = useState(null);

  const getProfile = async () => {
    try {
      console.log({ id: id, type: type, is_session: false });
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/get_user_info.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: id, type: type, is_session: false })
      });

      const data = await response.json();
      setUserData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const getProducts = async () => {
    try {
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/getFournisseurProduction.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_fournisseur: id })
      });

      const data = await response.json();
      setProducts(data);
      setLoadingProducts(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoadingProducts(false);
    }
  };

  // --- 2. UPDATED: Fetch Photos using Supabase Client ---
  const fetchPhotos = async () => {
    if (!id) return;
    setLoadingPhotos(true);
    setPhotosError(null);

    try {
      // A. Query the Database Table 'photos'
      // We filter by the 'target_id' passed in navigation (id)
      const { data: dbPhotos, error } = await supabase
        .from('photos')
        .select('*')
        .eq('target_id', id)
        // Optional: If you want to be strict about type (client vs fournisseur)
        // .eq('target_type', 'client')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // B. Generate Public URLs for the UI
      if (dbPhotos && dbPhotos.length > 0) {
        const photosWithUrls = dbPhotos.map((photo) => {
          // Use the filename or storage_path stored in DB to get the link
          const { data } = supabase.storage
            .from('media') // Bucket Name
            .getPublicUrl(photo.filename); // Or photo.storage_path depending on how you saved it

          return {
            ...photo,
            signed_url: data.publicUrl // Add the URL to the object
          };
        });
        setPhotos(photosWithUrls);
      } else {
        setPhotos([]);
      }
    } catch (err) {
      console.error('Fetch photos error:', err.message);
      setPhotosError("Could not load photos.");
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    getProfile();

    // Fetch photos for both types, or restrict if needed
    fetchPhotos();

    if (type === "fournisseur"){
      getProducts();
    }
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFD700" />
      );
    }

    return stars;
  };

  const randomMarketPictures = () => {
    let index = Math.floor(Math.random() * 4);
    let list_image = [
      "https://plus.unsplash.com/premium_photo-1686529896385-8a8d581d0225?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1572402123736-c79526db405a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1747816993831-3c8b50fd8edd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ]
    return list_image[index];
  }

  const renderProductCard = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: loadImages(item.id_produit) }} style={styles.productImage} />
      <Text style={styles.productName}>{item.nom_produit}</Text>
      <Text style={styles.productPrice}>FCFA {item.prix_produit}</Text>
      <Text style={styles.productDescription}>{item.description_produit}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00B14F" />
      </View>
    );
  }

  //const rating = userData.note_client || userData.note_fourni || 0;
  const rating = 3;
  const name =  userData.nom_fournisseur || userData.nom_client;
  const prenom = userData.prenom_fournisseur || userData.prenom_client;
  const isSupplier = userData.type === "fournisseur";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerImageContainer}>
          <Image
            style={styles.headerImage}
            source={{
              uri: isSupplier
                ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop'
                : randomMarketPictures()
            }}
          />
          <View style={styles.headerOverlay} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {/*
              <Image
                style={styles.profileImage}
                source={{
                  uri: isSupplier
                    ? 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&h=150&fit=crop&crop=face'
                    : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
                }}
              />*/}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {name} {prenom}
              </Text>

              {userData.nom_orga && (
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.locationText}>
                    {userData.nom_orga}, {userData.ville_organisation}
                  </Text>
                </View>
              )}

              <View style={styles.ratingContainer}>
                {/*<View style={styles.starsContainer}>
                  {renderStars(rating)}
                </View>*/}
                <Text style={styles.ratingText}>
                  {rating} ({userData.nb_commande || 0} {isSupplier ? 'commandes' : 'commandes'})
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {isSupplier ? (
            <>
              <View style={styles.statCard}>
                <Ionicons name="cube-outline" size={24} color="#00B14F" />
                <Text style={styles.statNumber}>{userData.nb_produit_fourni || 0}</Text>
                <Text style={styles.statLabel}>Products Supplied</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="pricetag-outline" size={24} color="#00B14F" />
                <Text style={styles.statNumber}>FCFA {userData.prix_produit || 0}</Text>
                <Text style={styles.statLabel}>Prix Moy.</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="receipt-outline" size={24} color="#00B14F" />
                <Text style={styles.statNumber}>{userData.nb_commande || 0}</Text>
                <Text style={styles.statLabel}>Total Commande</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.statCard}>
                <Ionicons name="receipt-outline" size={24} color="#00B14F" />
                <Text style={styles.statNumber}>{userData.nb_commande || 0}</Text>
                <Text style={styles.statLabel}>Total Commande</Text>
              </View>
{/*
              <View style={styles.statCard}>
                <Ionicons name="star" size={24} color="#FFD700" />
                <Text style={styles.statNumber}>{rating}</Text>
                <Text style={styles.statLabel}>Evaluation</Text>
              </View>*/}
            </>
          )}
        </View>

        {/* Featured Product/Service Section */}
        {isSupplier && userData.nom_produit && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Featured Product</Text>
            <View style={styles.featuredCard}>
              <Image
                style={styles.featuredImage}
                source={{
                  uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop'
                }}
              />
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredName}>{userData.nom_produit}</Text>
                <Text style={styles.featuredPrice}>FCFA{userData.prix_produit}</Text>
                <View style={styles.featuredRating}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.featuredRatingText}>{rating}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {isSupplier ? (
            <>
              <TouchableOpacity style={styles.primaryButton}>
                <Ionicons name="restaurant-outline" size={20} color="white" />
                <Text style={styles.primaryButtonText}>View Menu</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="information-circle-outline" size={20} color="#00B14F" />
                <Text style={styles.secondaryButtonText}>Store Info</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Produit par {userData.prenom_fournisseur || "le fournisseur"}</Text>
          {loadingProducts ? (
            <ActivityIndicator size="large" color="#00B14F" />
          ) : products.length > 0 ? (
            <FlatList
              data={products}
              renderItem={renderProductCard}
              keyExtractor={(item) => item.id_produit.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
            />
          ) : (
            <Text style={styles.noProductsText}>Aucun produit valide.</Text>
          )}
        </View>

        {/* --- 3. UPDATED: Photos UI Section --- */}
        <View style={[styles.productsSection, { marginBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Photos du fournisseur</Text>

          {loadingPhotos ? (
            <ActivityIndicator size="small" color="#00B14F" />
          ) : photosError ? (
            <Text style={{ color: '#FF6B6B', textAlign: 'center' }}>{photosError}</Text>
          ) : photos.length > 0 ? (
            <FlatList
              data={photos}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ marginRight: 12, width: 200 }}
                  onPress={() => {
                     // Optional: Add a full screen modal viewer here if needed
                     console.log('View photo:', item.signed_url);
                  }}
                >
                  <Image
                    source={{ uri: item.signed_url }}
                    style={{ width: 200, height: 150, borderRadius: 12, backgroundColor: '#eee' }}
                    resizeMode="cover"
                  />
                  {item.metadata?.caption && (
                     <Text numberOfLines={1} style={{ marginTop: 6, fontWeight: '600', fontSize: 12 }}>
                        {item.metadata.caption}
                     </Text>
                  )}
                  <Text style={{ color: '#999', fontSize: 10, marginTop: 2 }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.noProductsText}>Aucune photo disponible.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  headerImageContainer: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  profileSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: -30,
    marginHorizontal: 15,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  featuredSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  featuredCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  featuredImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  featuredInfo: {
    padding: 15,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  featuredPrice: {
    fontSize: 16,
    color: '#00B14F',
    fontWeight: '600',
    marginBottom: 5,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredRatingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 3,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 25,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#00B14F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    flex: 1,
    borderWidth: 2,
    borderColor: '#00B14F',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  secondaryButtonText: {
    color: '#00B14F',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  productsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  productsList: {
    paddingVertical: 10,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B14F',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
  },
  noProductsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProfilPublic;
