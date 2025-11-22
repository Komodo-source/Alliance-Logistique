import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
  StatusBar,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CarouselCards from "./sub_screens/CarouselCards";
import * as FileManager from "./util/file-manager.js";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { NavBarData } from "./util/UI_navbar.js";

const { width } = Dimensions.get("window");

const Accueil = ({ navigation }) => {

  const [commande, setCommande] = useState([]);
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nb_commande_livraison, setNbCommandeLivraison] = useState(0);
  const [userType, setIsClient] = useState('');
  const [jours_restants, setJours_restants] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [sponsorisedCommand, SetSponsorisedCommand] = useState([]);
  const [bestCommand, SetBestCommand] = useState([]);
  const [sponsoredProducts, setSponsoredProducts] = useState({});
  const [bestProducts, setBestProducts] = useState({});
  const { width: windowWidth } = useWindowDimensions();
  const snackBarRef = useRef();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetch_commande();
      setCurrentTime(new Date());
      snackBarRef.current?.show("Commande mis à jour(" + new Date() + ")", "info");
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getDaysDifference = (dateString) => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let targetDate;
      if (dateString.includes("T")) {
        targetDate = new Date(dateString);
      } else {
        targetDate = new Date(dateString.replace(" ", "T"));
      }
      const target = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error("Erreur dans getDaysDifference:", error, "dateString:", dateString);
      return 0;
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 17) return "Bon après-midi";
    return "Bonsoir";
  };

  const formatDeliveryDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    } catch (error) {
      return "Date invalide";
    }
  };

  const set_nb_commande_livraison = () => {
    let val = 0;
    for (let i = 0; i < commande.length; i++) {
      if (commande[i].id_status == 1 || commande[i].id_status == 2) {
        val++;
      }
    }
    setNbCommandeLivraison(val);
  };

  const getFileCommand = async () => {
    const sponsorisedData = await FileManager.read_file("sponsorisedCommand.json");
    const bestCommandData = await FileManager.read_file("mostCommandedProduct.json");
    const bestProducts = bestCommandData?._j || bestCommandData;
    const sponsoredProducts = sponsorisedData?._j || sponsorisedData;
    SetSponsorisedCommand(sponsoredProducts);
    SetBestCommand(bestProducts);
  };

  const fetch_commande = async () => {
    try {
      const data = await FileManager.read_file("auto.json");
      if (!data) {
        setCommande([]);
        return;
      }
      setIsClient(data.type);
      setUserData(data);
      let url_recup_cmd;
      if(data.type == "client"){
        url_recup_cmd = "https://backend-logistique-api-latest.onrender.com/recup_commande_cli.php"
      }else if(data.type == "fournisseur"){
        url_recup_cmd = "https://backend-logistique-api-latest.onrender.com/recup_commande_fourni.php"
      }else{
        url_recup_cmd = "https://backend-logistique-api-latest.onrender.com/recup_commande_cour.php"
      }
      const session_id = data.session_id;
      const response = await fetch(url_recup_cmd, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id }),
      });
      if (!response.ok) throw new Error(`Erreur réseau: ${response.status}`);
      const responseText = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Erreur de réponse serveur`);
      }
      if (!parsedData || !Array.isArray(parsedData)) {
        setCommande([]);
        return;
      }
      const limitedData = parsedData.slice(0, 3);
      setCommande(limitedData);
    } catch (error) {
      console.error("Error in fetch_commande:", error);
      setCommande([]);
    }
  };

  const quickActions = [
    ...(userType === "client"
      ? [
          {
            id: 1,
            title: "Nouvelle Commande",
            subtitle: "Créer maintenant",
            icon: "clipboard-plus-outline",
            gradient: ["#4F46E5", "#764ba2"],
            action: () => navigation.navigate("Formulaire"),
          },
        ]
      : []),

    {
      id: 2,
      title: "Mes Commandes",
      subtitle: "Suivre & gérer",
      icon: "package-variant-closed",
      gradient: ["#0F172A", "#f5576c"],
      action: () => navigation.navigate("Hub"),
    },
    {
      id: 3,
      title: "Catalogue",
      subtitle: "Découvrir",
      icon: "shopping-outline",
      gradient: ["#3B82F6", "#00f2fe"],
      action: () => navigation.navigate("Produit"),
    },
    ...(userType === "client"
      ? [
    {
      id: 4,
      title: "Planifier",
      subtitle: "Commandes auto",
      icon: "calendar-clock",
      gradient: ["#10B981", "#38f9d7"],
      action: () => navigation.navigate("commande_reccurente"),
    },
    ]
      : []),
  ];

  const categorie_produit = [
    { id: 1, title: "Légumes", action: () => navigation.navigate("Produit", { category: "Légume" }), icon: "carrot" },
    { id: 2, title: "Viandes", action: () => navigation.navigate("Produit", { category: "Viande" }), icon: "cow" },
    { id: 3, title: "Mer", action: () => navigation.navigate("Produit", { category: "Poisson" }), icon: "fish" },
    { id: 4, title: "Fruits", action: () => navigation.navigate("Produit", { category: "Fruit" }), icon: "apple-whole" },
    { id: 5, title: "Féculents", action: () => navigation.navigate("Produit", { category: "Féculent" }), icon: "wheat-awn" },
    { id: 6, title: "Divers", action: () => navigation.navigate("Produit", { category: "Divers" }), icon: "box-open" },
    { id: 7, title: "Epices", action: () => navigation.navigate("Produit", { category: "Epice" }), icon: "pepper-hot" },
    { id: 8, title: "Volaille", action: () => navigation.navigate("Produit", { category: "Volaille" }), icon: "drumstick-bite" },
  ];

  const renderCategorieChoice = ({ item }) => (
    <TouchableOpacity style={styles.catItem} onPress={item.action} activeOpacity={0.7}>
      <View style={styles.catIconCircle}>
        <FontAwesome6 name={item.icon} size={22} color="#475569" />
      </View>
      <Text style={styles.catText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderQuickAction = ({ item }) => (
    <TouchableOpacity
      style={[styles.quickActionBtn, { backgroundColor: item.gradient[0] }]}
      onPress={item.action}
      activeOpacity={0.9}
    >
        <View style={styles.quickActionIconBox}>
            <MaterialCommunityIcons name={item.icon} size={24} color="#FFF" />
        </View>
        <View>
            <Text style={styles.quickActionTitle}>{item.title}</Text>
            <Text style={styles.quickActionSub}>{item.subtitle}</Text>
        </View>
    </TouchableOpacity>
  );

  const renderCommande = ({ item }) => {
    const dic_status_color = {
      1: "#F59E0B",
      2: "#3B82F6",
      3: "#10B981",
    };
    const statusText = item.id_status === 1 ? "En cours" : item.id_status === 2 ? "Livré" : "Préparation";

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate("detail_Commande", { item })}
        activeOpacity={0.9}
      >
        <View style={styles.orderCardHeader}>
           <View style={[styles.statusDot, {backgroundColor: dic_status_color[item.id_status] || '#94A3B8'}]} />
           <Text style={[styles.statusLabel, {color: dic_status_color[item.id_status] || '#94A3B8'}]}>{statusText}</Text>
        </View>

        <Text style={styles.orderTitle} numberOfLines={1}>{item.nom_dmd}</Text>
        <Text style={styles.orderId}>#{item.id_public_cmd}</Text>

        <View style={styles.orderFooter}>
            <View style={styles.orderDateBox}>
                <MaterialCommunityIcons name="calendar-blank" size={14} color="#64748B" />
                <Text style={styles.orderDate}>{formatDeliveryDate(item.date_fin)}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
        </View>
      </TouchableOpacity>
    );
  };

  const BestProductsCard = ({ item }) => (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate("Produit", { category: item.produit })}
        activeOpacity={0.9}
      >
        {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.productImage} resizeMode="cover" />
        ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
                 <MaterialCommunityIcons name="food-variant" size={30} color="#CBD5E1" />
            </View>
        )}
        <View style={styles.productOverlay}>
            <Text style={styles.productName} numberOfLines={1}>{item.nom_produit}</Text>
            <View style={styles.productTag}>
                <Text style={styles.productTagText}>Top Vente</Text>
            </View>
        </View>
      </TouchableOpacity>
  );

  const SponsoredProductCard = ({ item }) => (
      <TouchableOpacity
        style={styles.sponsoredCard}
        onPress={() => navigation.navigate('ProfilPublic', {id: item.id_fournisseur, type: "fournisseur"})}
        activeOpacity={0.9}
      >
        <View style={styles.sponsoredContent}>
            <Text style={styles.sponsoredTitle} numberOfLines={2}>{item.nom_produit}</Text>
            <Text style={styles.sponsoredSub}>{item.nom_orga}</Text>
            <View style={styles.sponsoredBadge}>
                <Text style={styles.sponsoredBadgeText}>Sponsorisé</Text>
            </View>
        </View>
      </TouchableOpacity>
  );

  const loadSponsoredData = async () => {
    try {
      const sponsoredData = await FileManager.read_file("sponsorisedCommand.json");
      const bestProductsData = await FileManager.read_file("mostCommandedProduct.json");
      if (sponsoredData) setSponsoredProducts(sponsoredData);
      if (bestProductsData) setBestProducts(bestProductsData);
    } catch (error) {
      console.error("Error loading sponsored data:", error);
    }
  };

  useEffect(() => {
    fetch_commande();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    set_nb_commande_livraison();
  }, [commande]);

  useEffect(() => {
    if (commande.length > 0) {
        setJours_restants(getDaysDifference(commande[0].date_fin));
    }
}, [commande, currentTime]);

  useEffect(() => {
    loadSponsoredData();
    getFileCommand();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header Fixed */}
      <View style={styles.header}>
          <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.username}>{userData?.firstname || "Utilisateur"}</Text>
          </View>
          <View style={styles.headerRight}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userData?.firstname?.[0]}{userData?.name?.[0]}</Text>
              </View>
          </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />
        }
      >
        {/* Hero Section: Next Delivery */}
        {commande.length > 0 ? (
        <View style={styles.heroSection}>
            <View style={styles.heroCard}>
                <View style={styles.heroHeader}>
                    <View style={styles.heroIcon}>
                        <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#FFF" />
                    </View>
                    <View style={styles.heroBadge}>
                         <Text style={styles.heroBadgeText}>
                            {jours_restants === 0 ? "Aujourd'hui" : jours_restants < 0 ? "En retard" : `J-${jours_restants}`}
                         </Text>
                    </View>
                </View>
                <Text style={styles.heroTitle} numberOfLines={1}>{commande[0].nom_dmd}</Text>
                <Text style={styles.heroDate}>Livraison prévue le {formatDeliveryDate(commande[0].date_fin)}</Text>

                <TouchableOpacity
                    style={styles.heroBtn}
                    onPress={() => navigation.navigate("detail_Commande", { item: commande[0] })}
                >
                    <Text style={styles.heroBtnText}>Suivre la commande</Text>
                    <MaterialCommunityIcons name="arrow-right" size={16} color="#4F46E5" />
                </TouchableOpacity>
            </View>
        </View>
        ) : (
            <View style={styles.welcomeCard}>
                <MaterialCommunityIcons name="hand-wave" size={32} color="#4F46E5" />
                <Text style={styles.welcomeTitle}>Bienvenue sur votre Hub</Text>
                <Text style={styles.welcomeSub}>Commencez par créer votre première commande.</Text>
            </View>
        )}

        {/* Dashboard Stats */}
        <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{commande.length}</Text>
                <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statItem}>
                <Text style={[styles.statValue, {color: '#10B981'}]}>{nb_commande_livraison}</Text>
                <Text style={styles.statLabel}>En route</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Alerte</Text>
            </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Accès Rapide</Text>
            <FlatList
                data={quickActions}
                renderItem={renderQuickAction}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hListContent}
            />
        </View>

        {/* Recent Orders */}
        {commande.length > 0 && (
        <View style={styles.sectionContainer}>
             <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeader}>{userType === 'coursier' ? 'Tournée' : 'Commandes Récentes'}</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Hub")}>
                    <Text style={styles.seeAll}>Voir tout</Text>
                </TouchableOpacity>
             </View>
            <FlatList
                data={commande}
                renderItem={renderCommande}
                keyExtractor={item => item.id_dmd.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hListContent}
            />
        </View>
        )}

        {/* Categories */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Parcourir par Rayon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
                {categorie_produit.map((item) => (
                    <View key={item.id} style={{marginRight: 20}}>
                        {renderCategorieChoice({item})}
                    </View>
                ))}
            </ScrollView>
        </View>

        {/* Featured Products */}
        {(Object.keys(bestProducts).length > 0 || Object.keys(sponsoredProducts).length > 0) && (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Tendances</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hListContent}>
                 {/* Render Best Products */}
                 {Array.isArray(bestProducts) && bestProducts.map((item, index) => (
                     <View key={`best-${index}`} style={{marginRight: 15}}>
                         <BestProductsCard item={item} />
                     </View>
                 ))}
                 {/* Render Sponsored */}
                 {Array.isArray(sponsoredProducts) && sponsoredProducts.map((item, index) => (
                     <View key={`spon-${index}`} style={{marginRight: 15}}>
                         <SponsoredProductCard item={item} />
                     </View>
                 ))}
            </ScrollView>
        </View>
        )}

        {/* Carousel / Business Overview */}
        <View style={styles.carouselSection}>
             <Text style={[styles.sectionHeader, {paddingHorizontal: 20, marginBottom: 10}]}>Aperçu Business</Text>
             <CarouselCards />
        </View>

        {/* Promo Banner */}
        <View style={styles.promoContainer}>
            <View style={styles.promoContent}>
                <View>
                    <Text style={styles.promoTitle}>-15% sur l'auto</Text>
                    <Text style={styles.promoText}>Automatisez vos commandes.</Text>
                </View>
                <TouchableOpacity
                    style={styles.promoBtn}
                    onPress={() => navigation.navigate("commande_reccurente")}
                >
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* Floating NavBar Wrapper */}
      <View style={styles.navWrapper}>
        <NavBarData navigation={navigation} active_page="accueil" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  username: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '700',
  },

  // Hero Card
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
    marginTop: 8,
  },
  heroCard: {
    backgroundColor: '#4F46E5', // Indigo 600
    borderRadius: 24,
    padding: 24,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  heroBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroBtnText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 14,
  },

  // Welcome Empty State
  welcomeCard: {
    padding: 24,
    marginHorizontal: 24,
    backgroundColor: '#FFF',
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  welcomeSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    width: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },

  // Sections
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  hListContent: {
    paddingHorizontal: 24,
    gap: 16,
  },

  // Quick Actions
  quickActionBtn: {
    width: 140,
    height: 150,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  quickActionSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },

  // Order Cards
  orderCard: {
    backgroundColor: '#FFFFFF',
    width: 220,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginRight: 12,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  orderDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Categories
  catList: {
    paddingHorizontal: 24,
  },
  catItem: {
    alignItems: 'center',
    width: 64,
  },
  catIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Product Cards
  productCard: {
    width: 160,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)', // Subtle darkening
    backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', // Just simulation logic
  },
  productName: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  productTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  productTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Sponsored
  sponsoredCard: {
    width: 200,
    height: 120,
    backgroundColor: '#0F172A', // Dark slate
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
  },
  sponsoredContent: {
    justifyContent: 'space-between',
    height: '100%',
  },
  sponsoredTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sponsoredSub: {
    color: '#94A3B8',
    fontSize: 12,
  },
  sponsoredBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sponsoredBadgeText: {
    color: '#CBD5E1',
    fontSize: 10,
    textTransform: 'uppercase',
  },

  // Carousel
  carouselSection: {
    marginBottom: 30,
  },

  // Promo Banner
  promoContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  promoContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  promoText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  promoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Navbar
  navWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default Accueil;
