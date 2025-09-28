import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
  StatusBar,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
//import * as FileSystem from 'expo-file-system';
import CarouselCards from "./sub_screens/CarouselCards";
import * as FileManager from "./util/file-manager.js";
import { debbug_log } from "./util/debbug.js";
const { width, height } = Dimensions.get("window");
//import axios from 'axios';
//import { debbug_log } from './util/debbug.js';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Accueil = ({ navigation }) => {
  const [commande, setCommande] = useState([]);
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nb_commande_livraison, setNbCommandeLivraison] = useState(0);
  const [isClient, setIsClient] = useState(true);
  // Update time every minute for dynamic greeting
  const [jours_restants, setJours_restants] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(["Item 1", "Item 2", "Item 3"]);
  //fetch data
  const [sponsorisedCommand, SetSponsorisedCommand] = useState([]);
  const [bestCommand, SetBestCommand] = useState([]);
  const [sponsoredProducts, setSponsoredProducts] = useState({});
  const [bestProducts, setBestProducts] = useState({});
  const { width } = useWindowDimensions();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Fetch commandes
      await fetch_commande();

      // Update current time
      setCurrentTime(new Date());
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Helper to calculate days difference
  const getDaysDifference = (dateString) => {
    try {
      // Créer les dates en ignorant l'heure pour une comparaison juste des jours
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Parser la date de livraison
      let targetDate;
      if (dateString.includes("T")) {
        targetDate = new Date(dateString);
      } else {
        // Si la date est au format "YYYY-MM-DD HH:MM:SS"
        targetDate = new Date(dateString.replace(" ", "T"));
      }

      const target = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );

      // Calculer la différence en millisecondes
      const diffTime = target.getTime() - today.getTime();

      // Convertir en jours (division par millisecondes dans une journée)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error(
        "Erreur dans getDaysDifference:",
        error,
        "dateString:",
        dateString
      );
      return 0;
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 17) return "Bon après-midi";
    return "Bonsoir";
  };

  // Fonction utilitaire pour formater les dates
  const formatDeliveryDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    } catch (error) {
      console.error("Erreur formatage date:", error, "dateString:", dateString);
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
    const sponsorisedData = await FileManager.read_file(
      "sponsorisedCommand.json"
    );
    const bestCommandData = await FileManager.read_file(
      "mostCommandedProduct.json"
    );

    // Extract the actual data if wrapped in a structure
    const bestProducts = bestCommandData?._j || bestCommandData;
    const sponsoredProducts = sponsorisedData?._j || sponsorisedData;

    SetSponsorisedCommand(sponsoredProducts);
    SetBestCommand(bestProducts);

    console.log("Sponsored Products:", sponsoredProducts);
    console.log("Best Products:", bestProducts);
  };

  const fetch_commande = async () => {
    try {
      const data = await FileManager.read_file("auto.json");

      console.log("User data from auto.json:", data);

      if (!data) {
        console.error("No user data or user ID found in auto.json");
        setCommande([]);
        return;
      }

      setIsClient(data.type === "client");
      setUserData(data);
      const session_id = data.session_id;
      console.log("session_id : ", session_id);

      const response = await fetch(
        "https://backend-logistique-api-latest.onrender.com/recup_commande_cli.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Server response:", responseText);

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response was:", responseText);
        throw new Error(
          `Erreur de réponse serveur: ${responseText.substring(0, 100)}...`
        );
      }

      console.log("Parsed data:", parsedData);

      if (!parsedData || !Array.isArray(parsedData)) {
        console.log("Invalid data format received");
        setCommande([]);
        return;
      }

      // Limiter à 3 commandes pour l'affichage
      const limitedData = parsedData.slice(0, 3);
      console.log("Limited data for display:", limitedData);

      setCommande(limitedData);
    } catch (error) {
      console.error("Error in fetch_commande:", error);
      setCommande([]);
    }
  };

  // Enhanced quick actions with better visual hierarchy
  const quickActions = [
    ...(isClient
      ? [
          {
            id: 1,
            title: "Nouvelle Commande",
            subtitle: "Créer maintenant",
            icon: "📋",
            gradient: ["#667eea", "#764ba2"],
            action: () => navigation.navigate("Formulaire"),
          },
        ]
      : []),

    {
      id: 2,
      title: "Mes Commandes",
      subtitle: "Suivre & gérer",
      icon: "📦",
      gradient: ["#f093fb", "#f5576c"],
      action: () => navigation.navigate("Hub"),
    },
    {
      id: 3,
      title: "Catalogue",
      subtitle: "Découvrir",
      icon: "🛍️",
      gradient: ["#4facfe", "#00f2fe"],
      action: () => navigation.navigate("Produit"),
    },
    {
      id: 4,
      title: "Planifier",
      subtitle: "Commandes auto",
      icon: "⏰",
      gradient: ["#43e97b", "#38f9d7"],
      action: () => navigation.navigate("commande_reccurente"),
    },
  ];

  const categorie_produit = [
    {
      id: 1,
      title: "Légume",
      action: () => navigation.navigate("Produit", { category: "Légume" }),
      icon: "carrot",
    },
    {
      id: 2,
      title: "Viande",
      action: () => navigation.navigate("Produit", { category: "Viande" }),
      icon: "cow",
    },
    {
      id: 3,
      title: "Poisson/Fruit de mer",
      action: () => navigation.navigate("Produit", { category: "Poisson" }),
      icon: "fish",
    },
    {
      id: 4,
      title: "Fruit",
      action: () => navigation.navigate("Produit", { category: "Fruit" }),
      icon: "food-apple",
    },
    {
      id: 5,
      title: "Féculent",
      action: () => navigation.navigate("Produit", { category: "Féculent" }),
      icon: "pasta",
    },
    {
      id: 6,
      title: "Divers",
      action: () => navigation.navigate("Produit", { category: "Divers" }),
      icon: "minus-box",
    },
    {
      id: 7,
      title: "Epice",
      action: () => navigation.navigate("Produit", { category: "Epice" }),
      icon: "chili-mild",
    },
    {
      id: 8,
      title: "Volaille",
      action: () => navigation.navigate("Produit", { category: "Volaille" }),
      icon: "food-drumstick",
    },
  ];

  const renderCategorieChoice = ({ item, index }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.8}
      onPress={item.action}
    >
      <View style={styles.cardContent}>
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={item.icon} size={32} color="#2773F5" />
        </View>

        {/* Title */}
        <Text style={styles.categoryTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Optional badge for popular categories */}
        {item.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.badgeText}>Popular</Text>
          </View>
        )}
      </View>

      {/* Subtle shadow overlay */}
      <View style={styles.shadowOverlay} />
    </TouchableOpacity>
  );

  const renderQuickAction = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.quickActionCard,
        {
          backgroundColor: item.gradient[0],
          transform: [{ scale: 1 }],
          marginLeft: index === 0 ? 20 : 8,
          marginRight: index === quickActions.length - 1 ? 20 : 8,
        },
      ]}
      onPress={item.action}
      activeOpacity={0.8}
    >
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionIcon}>{item.icon}</Text>
        <Text style={styles.quickActionTitle}>{item.title}</Text>
        <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.quickActionArrow}>
        <Text style={styles.arrowIcon}>→</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCommande = ({ item, index }) => {
    const getStatusColor = (status) => {
      return "#4CAF50";
    };

    const dic_status_color = {
      1: "#FFA726",
      2: "#0a75d3",
      3: "#06bd09",
    };

    return (
      <TouchableOpacity
        style={[
          styles.commandeCard,
          {
            marginLeft: index === 0 ? 20 : 8,
            marginRight: index === commande.length - 1 ? 20 : 8,
          },
        ]}
        onPress={() => navigation.navigate("detail_Commande", { item })}
        activeOpacity={0.9}
      >
        <View style={styles.commandeHeader}>
          <View style={styles.commandeInfo}>
            <Text style={styles.commandeName} numberOfLines={1}>
              {item.nom_dmd}
            </Text>
            <Text style={styles.commandeNumber}>#{item.id_public_cmd}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: dic_status_color[item.id_status] },
            ]}
          >
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {item.id_status == 1
                ? "En préparation"
                : item.id_status == 1
                ? "En cours de livraison"
                : "Livré"}
            </Text>
          </View>
        </View>

        <View style={styles.commandeDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Livraison prévue</Text>
            <Text style={styles.detailValue}>
              {formatDeliveryDate(item.date_fin)}
            </Text>
          </View>
          {/* Days remaining for this command */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏳ Jours restants</Text>
            <Text style={styles.detailValue}>
              {(() => {
                const daysDiff = getDaysDifference(item.date_fin);
                if (daysDiff > 0) {
                  return `${daysDiff} jour${daysDiff > 1 ? "s" : ""}`;
                } else if (daysDiff === 0) {
                  return "Livraison aujourd'hui";
                } else {
                  return "Livraison dépassée";
                }
              })()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const BestProductsCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.sponsoredCard}
        onPress={() =>
          navigation.navigate("Produit", { category: item.produit })
        }
      >
        <View style={styles.sponsoredImageContainer}>
          <Image
            source={{ uri: item.image_url }}
            style={styles.sponsoredImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.sponsoredInfo}>
          <Text style={styles.sponsoredName} numberOfLines={1}>
            {item.nom_produit}
          </Text>
          <Text style={styles.sponsoredSupplier} numberOfLines={1}>
            Commandés: {item.total_commandes} fois
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const SponsoredProductCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.sponsoredCard}
        //onPress={() => navigation.navigate('ProfilPublic', {id: item.id_fournisseur, type: "fournisseur"})}
      >
        {/*<View style={styles.sponsoredImageContainer}>
          <Image
            source={{ uri: item.image_url }}
            style={styles.sponsoredImage}
            resizeMode="cover"
          />
        </View>*/}
        <View style={styles.sponsoredInfo}>
          <Text style={styles.sponsoredName} numberOfLines={1}>
            {item.nom_produit}
          </Text>
          <Text style={styles.sponsoredSupplier} numberOfLines={1}>
            {item.nom_orga}
          </Text>
          <Text style={styles.sponsoredSupplier} numberOfLines={1}>
            {item.prenom_fournisseur}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const loadSponsoredData = async () => {
    try {
      const sponsoredData = await FileManager.read_file(
        "sponsorisedCommand.json"
      );
      const bestProductsData = await FileManager.read_file(
        "mostCommandedProduct.json"
      );

      if (sponsoredData) {
        setSponsoredProducts(sponsoredData);
      }
      if (bestProductsData) {
        setBestProducts(bestProductsData);
      }
    } catch (error) {
      console.error("Error loading sponsored data:", error);
    }
  };

  useEffect(() => {
    console.log("=== ACCUEIL: useEffect déclenché ===");
    fetch_commande();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Mettre à jour le nombre de commandes en livraison quand les commandes changent
  useEffect(() => {
    console.log("=== ACCUEIL: Mise à jour nb_commande_livraison ===");
    console.log("Commandes actuelles:", commande);
    set_nb_commande_livraison();
  }, [commande]);

  // Update jours_restants when commandes or time changes
  useEffect(() => {
    if (commande.length > 0) {
      setJours_restants(getDaysDifference(commande[0].date_fin));
    }
    getFileCommand();
  }, [commande, currentTime]);

  // Load sponsored data on mount
  useEffect(() => {
    loadSponsoredData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]} // Android
            tintColor="#3B82F6" // iOS
            title="Pull to refresh" // iOS
            titleColor="#64748B" // iOS
          />
        }
      >
        {/* Enhanced Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>{getGreeting()}!</Text>
            <Text style={styles.businessName}>
              {userData?.nom || "Votre Hub Professionnel"}
            </Text>
            <Text style={styles.dateText}>
              {currentTime.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>0</Text>
            </View>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{commande.length}</Text>
            <Text style={styles.statLabel}>Commandes actives</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{nb_commande_livraison}</Text>
            <Text style={styles.statLabel}>En livraison</Text>
          </View>

          {/*        <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Ce mois</Text>
          </View>*/}
        </View>

        {/* Enhanced Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          />
        </View>

        {/* Sponsored Products Section */}
        {Object.keys(sponsoredProducts).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Produits Sponsorisés</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Produit")}>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={
                Array.isArray(sponsoredProducts)
                  ? sponsoredProducts
                  : [sponsoredProducts]
              }
              renderItem={({ item }) => <SponsoredProductCard item={item} />}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sponsoredContainer}
              snapToInterval={width * 0.75}
              decelerationRate="fast"
              pagingEnabled
            />
          </View>
        )}

        {/* Next Delivery Highlight */}
        {commande.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚚 Prochaine Livraison</Text>
            <View style={[styles.nextDeliveryCard, { marginTop: 20 }]}>
              <View style={styles.deliveryHeader}>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryTitle}>
                    {commande[0].nom_dmd}
                  </Text>
                  <Text style={styles.deliveryDate}>
                    {new Date(commande[0].date_fin).toLocaleDateString(
                      "fr-FR",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      }
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    styles.deliveryStatus,
                    {
                      backgroundColor:
                        jours_restants === 0
                          ? "#fedec3"
                          : jours_restants > 0
                          ? "#d1fae5"
                          : "#fecece",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.deliveryStatusText,
                      {
                        color:
                          jours_restants === 0
                            ? "#835407"
                            : jours_restants > 0
                            ? "#065f46"
                            : "#6f0606",
                      },
                    ]}
                  >
                    {jours_restants > 0
                      ? `${jours_restants} jour${jours_restants > 1 ? "s" : ""}`
                      : jours_restants === 0
                      ? "Livraison aujourd'hui"
                      : "Livraison dépassée"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.trackButton}
                onPress={() =>
                  navigation.navigate("detail_Commande", { item: commande[0] })
                }
              >
                <Text style={styles.trackButtonText}>Suivre la commande</Text>
                <Text style={styles.trackButtonIcon}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent Orders with horizontal scroll */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Commandes Récentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Hub")}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {commande && commande.length > 0 ? (
            <FlatList
              data={commande}
              renderItem={renderCommande}
              keyExtractor={(item) => item.id_dmd.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.commandesContainer}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>
                Aucune commande récente
              </Text>
              <Text style={styles.emptyStateDescription}>
                Commencez par créer votre première commande
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate("Formulaire")}
              >
                <Text style={styles.primaryButtonText}>Créer une commande</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Category */}
        <View>
          <Text style={styles.sectionTitle}>Rechercher par catégorie</Text>
          <FlatList
            data={categorie_produit}
            renderItem={renderCategorieChoice}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          />
        </View>

        {/* Best Product */}
        {Object.keys(bestProducts).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Produits les plus côtés</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Produit")}>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={Array.isArray(bestProducts) ? bestProducts : [bestProducts]}
              renderItem={({ item }) => <BestProductsCard item={item} />}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sponsoredContainer}
              snapToInterval={width * 0.75}
              decelerationRate="fast"
              pagingEnabled
            />
          </View>
        )}

        {/* Enhanced Carousel Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aperçu Business</Text>
          <View style={styles.carouselContainer}>
            <CarouselCards />
          </View>
        </View>

        {/* Enhanced Promo Section */}
        <View style={styles.section}>
          <View style={styles.promoCard}>
            <View style={styles.promoHeader}>
              <Text style={styles.promoTitle}>💡 Optimisez vos commandes</Text>
              <Text style={styles.promoDiscount}>-15%</Text>
            </View>
            <Text style={styles.promoText}>
              Programmez vos commandes récurrentes et bénéficiez de tarifs
              préférentiels automatiquement.
            </Text>
            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => navigation.navigate("commande_reccurente")}
            >
              <Text style={styles.promoButtonText}>Découvrir</Text>
              <Text style={styles.promoButtonIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Extra padding for bottom navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Enhanced Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Produit")}
        >
          <View style={styles.iconContainer}>
            <Image
              style={styles.logoNavBar}
              source={require("../assets/Icons/Dark-Product.png")}
            />
          </View>
          <Text style={styles.navButtonText}>Produit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.activeButton]}
          onPress={() => navigation.navigate("Accueil")}
        >
          <View style={styles.iconContainer}>
            <Image
              style={[styles.logoNavBar, styles.activeIcon]}
              source={require("../assets/Icons/Dark-House.png")}
            />
          </View>
          <Text style={[styles.navButtonText, styles.activeText]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Hub")}
        >
          <View style={styles.iconContainer}>
            <Image
              style={styles.logoNavBar}
              source={require("../assets/Icons/Dark-Hub.png")}
            />
          </View>
          <Text style={styles.navButtonText}>Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Profil")}
        >
          <View style={styles.iconContainer}>
            <Image
              style={styles.logoNavBar}
              source={require("../assets/Icons/Dark-profile.png")}
            />
          </View>
          <Text style={styles.navButtonText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  categoryCard: {
    width: 120,
    height: 120,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3436",
    textAlign: "center",
    lineHeight: 18,
    flex: 1,
  },
  popularBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  shadowOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.02)",
    pointerEvents: "none",
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Enhanced Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  businessName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 4,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  notificationButton: {
    position: "relative",
    padding: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  notificationCount: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  notificationIcon: {
    fontSize: 24,
  },

  // Stats Overview
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },

  // Section Styles
  section: {
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E293B",
    marginLeft: 20,
  },
  seeAllText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },

  // Enhanced Quick Actions
  quickActionsContainer: {
    paddingVertical: 8,
  },
  quickActionCard: {
    width: 160,
    minHeight: 120,
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    justifyContent: "space-between",
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "500",
  },
  quickActionArrow: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  arrowIcon: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Next Delivery Card
  nextDeliveryCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  deliveryStatus: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  deliveryStatusText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  trackButtonText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  trackButtonIcon: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "700",
  },

  // Enhanced Command Cards
  commandesContainer: {
    paddingVertical: 8,
  },
  commandeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  commandeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  commandeInfo: {
    flex: 1,
  },
  commandeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  commandeNumber: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  commandeDetails: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 2,
  },

  // Enhanced Empty State
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Carousel
  carouselContainer: {
    marginHorizontal: 20,
    marginTop: 12,
  },

  // Enhanced Promo Card
  promoCard: {
    backgroundColor: "#FFFBEB",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  promoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400E",
    flex: 1,
  },
  promoDiscount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#D97706",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  promoText: {
    fontSize: 14,
    color: "#78716C",
    lineHeight: 20,
    marginBottom: 16,
  },
  promoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  promoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },
  promoButtonIcon: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Enhanced Bottom Navigation
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    minHeight: 60,
  },

  activeButton: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
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
    tintColor: "#666666",
  },

  activeIcon: {
    tintColor: "#FFFFFF",
    width: 26,
    height: 26,
  },

  navButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
    textAlign: "center",
  },
  activeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  suggestionCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    minWidth: 140,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  suggestionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
  },
  sponsoredCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: width * 0.75,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  sponsoredContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sponsoredImageContainer: {
    position: "relative",
    height: 150,
  },
  sponsoredImage: {
    width: "100%",
    height: "100%",
  },
  sponsoredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sponsoredBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  sponsoredInfo: {
    padding: 16,
  },
  sponsoredName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  sponsoredPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#3B82F6",
    marginBottom: 4,
  },
  sponsoredSupplier: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
});

export default Accueil;
