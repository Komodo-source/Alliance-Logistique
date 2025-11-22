import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Image,
  FlatList,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as FileManager from "./util/file-manager.js";
const { width, height } = Dimensions.get("window");
import { NavBarData } from "./util/UI_navbar.js";
import * as fileManager from "./util/file-manager.js";
import { getAlertRef } from "./util/AlertService";
import { debbug_log } from "./util/debbug.js";
import { getUserDataType } from "./util/Polyvalent.js";

const Hub = ({ navigation }) => {
  const [commande, setCommande] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, completed, cancelled
  const [userType, setUserType] = useState("");

  const handleDisconnect = async () => {
    getAlertRef().current?.showAlert(
      "Aïe",
      "Une erreur à eu lieu veuillez vous reconnecter",
      true,
      "continuer",
      null
    );
    try {
      // Clear all user data
      await fileManager.modify_value_local_storage("id", "", "auto.json");
      await fileManager.modify_value_local_storage("name", "", "auto.json");
      await fileManager.modify_value_local_storage(
        "firstname",
        "",
        "auto.json"
      );
      await fileManager.modify_value_local_storage("type", "", "auto.json");
      await fileManager.modify_value_local_storage(
        "stay_loogged",
        false,
        "auto.json"
      );
      //await fileManager.modify_value_local_storage("first_conn", true, 'auto.json');

      debbug_log("User logged out successfully", "green");
      navigation.navigate("HomePage");
    } catch (error) {
      console.error("Error during logout:", error);
      debbug_log("Error during logout: " + error.message, "red");
      // Still navigate even if there's an error
      navigation.navigate("HomePage");
    }
  };

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
      const fileUri = FileSystem.documentDirectory + "product.json";
      console.log("lecture du fichier:", fileUri);

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.warn("Fichier inexistant:", fileUri);
        return null;
      }

      const fileContents = await FileSystem.readAsStringAsync(fileUri);
      console.log("Contenu du fichier:", fileContents);

      const parsedData = JSON.parse(fileContents);
      console.log("Parse du json:", parsedData);

      return parsedData;
    } catch (error) {
      console.error("Error reading product.json:", error);

      if (error instanceof SyntaxError) {
        console.error("Failed to parse JSON - file may be corrupted");
      } else if (error.code === "ENOENT") {
        console.error("File not found - path may be incorrect");
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
      setUserType(data.type);

      debbug_log("UserType: " + data.type, "cyan");
      let url_recup_cmd;
      if (data.type == "client") {
        url_recup_cmd =
          "https://backend-logistique-api-latest.onrender.com/recup_commande_cli.php";
      } else if (data.type == "fournisseur") {
        url_recup_cmd =
          "https://backend-logistique-api-latest.onrender.com/recup_commande_fourni.php";
      } else {
        url_recup_cmd =
          "https://backend-logistique-api-latest.onrender.com/recup_commande_cour.php";
      }

      const response = await fetch(url_recup_cmd, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Commandes récupérées:", responseData);
      if (responseData.error === "Invalid session_id") {
        handleDisconnect();
      }
      setCommande(Array.isArray(responseData) ? responseData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching commands:", error);
      setCommande([]);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "En préparation":
      case "En préparation":
        return "#F59E0B"; // Amber
      case "Livré":
      case "Livré":
      case "livré":
        return "#10B981"; // Emerald
      case "cancelled":
      case "annulé":
        return "#EF4444"; // Red
      case "En cours de livraison":
      case "En cours de livraison":
        return "#4F46E5"; // Indigo
      default:
        return "#64748B"; // Slate
    }
  };

  const getStatusEquivalent = {
    1: "En préparation",
    2: "En cours de livraison",
    3: "Livré",
    4: "Annulé",
  };

  const getStatusText = (status) => {
    switch (status) {
      case "En préparation":
      case "En préparation":
        return "En attente";
      case "Livré":
      case "Livré":
      case "livré":
        return "Livré";
      case "annulé":
      case "annulé":
        return "Annulé";
      case "En cours de livraison":
      case "En cours de livraison":
        return "En cours";
      default:
        return "Statut inconnu";
    }
  };

  const filteredCommandes = commande.filter((item) => {
    if (filter === "all") return true;

    const statusMap = {
      "En préparation": 1,
      "En cours de livraison": 2,
      Livré: 3,
      annulé: 4,
    };

    return item.id_status === statusMap[filter];
  });

  const renderCommande = ({ item, index }) => {
    if (!item) return null;

    const handlePress = () => {
      try {
        if (navigation && navigation.navigate) {
          navigation.navigate("detail_Commande", { item });
        }
      } catch (error) {
        console.error("Navigation error:", error);
        Alert.alert("Erreur", "Impossible d'ouvrir les détails de la commande");
      }
    };

    const statusRaw = getStatusEquivalent[item.id_status];
    const statusColor = getStatusColor(statusRaw);
    const statusText = statusRaw;

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {/* Status Strip */}
        <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />

        <View style={styles.cardInner}>
          {/* Header Part */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cmdId}>CMD #{item.id_public_cmd || "---"}</Text>
              <Text style={styles.cmdTitle} numberOfLines={1}>
                {item.nom_dmd || `Commande #${index + 1}`}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + "15" }, // 15 is roughly 8% opacity hex
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Date Section */}
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={20}
                color="#64748B"
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>LIVRAISON ESTIMÉE</Text>
              <Text style={styles.detailValue}>
                {item.date_fin
                  ? new Date(item.date_fin).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : "Date non définie"}
              </Text>
            </View>
          </View>

          {/* Description (if any) */}
          {item.desc_dmd ? (
            <View style={styles.detailRow}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  name="text-short"
                  size={20}
                  color="#64748B"
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>NOTE</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {item.desc_dmd}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Products Preview */}
          <View style={styles.productPreviewContainer}>
            <Text style={styles.productPreviewHeader}>
              {item.produits?.length || 0} Article
              {item.produits?.length > 1 ? "s" : ""}
            </Text>
            <View style={styles.previewList}>
              {item.produits &&
                Array.isArray(item.produits) &&
                item.produits.slice(0, 2).map((produit, prodIndex) => (
                  <View key={prodIndex} style={styles.previewItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.previewText} numberOfLines={1}>
                      <Text style={styles.previewQty}>
                        {produit.quantite}x{" "}
                      </Text>
                      {produit.nom_produit}
                    </Text>
                  </View>
                ))}
              {item.produits && item.produits.length > 2 && (
                <Text style={styles.moreItems}>
                  +{item.produits.length - 2} autres...
                </Text>
              )}
            </View>
          </View>

          {/* Action Footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.viewDetailsLabel}>Voir le détail</Text>
            <MaterialCommunityIcons
              name="arrow-right-circle"
              size={28}
              color="#4F46E5"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filterType, label, iconName) => {
    const isActive = filter === filterType;
    return (
      <TouchableOpacity
        style={[styles.filterPill, isActive && styles.filterPillActive]}
        onPress={() => setFilter(filterType)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={18}
          color={isActive ? "#FFFFFF" : "#64748B"}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <MaterialCommunityIcons
          name={filter === "all" ? "inbox-outline" : "filter-remove-outline"}
          size={48}
          color="#94A3B8"
        />
      </View>
      <Text style={styles.emptyTitle}>
        {filter === "all" ? "C'est calme ici..." : "Aucun résultat"}
      </Text>
      <Text style={styles.emptySub}>
        {filter === "all"
          ? "Vous n'avez aucune commande active pour le moment."
          : "Aucune commande ne correspond à ce filtre."}
      </Text>

      {isClient && filter === "all" && (
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => {
            try {
              navigation.navigate("Formulaire");
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.ctaText}>Nouvelle commande</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  useEffect(() => {
    fetch_commande();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greetingSub}>
            {userData ? `Bonjour, ${userData.firstname}` : "Bienvenue"}
          </Text>
          <Text style={styles.pageTitle}>
            {userType === "coursier" ? "Mes Livraisons" : "Hub Central"}
          </Text>
        </View>
        <View style={styles.avatarPlaceholder}>
           <Text style={styles.avatarInitials}>
             {userData?.firstname?.[0]}{userData?.name?.[0]}
           </Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Feature Banner (Client Only) */}
        {userType === "client" && (
          <TouchableOpacity
            style={styles.featureBanner}
            activeOpacity={0.9}
            onPress={() => {
              try {
                navigation.navigate("commande_reccurente");
              } catch (error) {
                console.error("Navigation error:", error);
              }
            }}
          >
            <View style={styles.featureIconBox}>
              <MaterialCommunityIcons name="repeat-variant" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Commandes Récurrentes</Text>
              <Text style={styles.featureSub}>Gérez vos abonnements auto</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Filters */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {renderFilterButton("all", "Tout", "layers-outline")}
            {renderFilterButton("En préparation", "En attente", "clock-time-four-outline")}
            {renderFilterButton("En cours de livraison", "En cours", "truck-fast-outline")}
            {renderFilterButton("Livré", "Terminé", "check-all")}
            {renderFilterButton("annulé", "Annulé", "close-circle-outline")}
          </ScrollView>
        </View>

        {/* Main List */}
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingState}>
              <MaterialCommunityIcons name="loading" size={32} color="#4F46E5" style={styles.spinner} />
              <Text style={styles.loadingLabel}>Synchronisation...</Text>
            </View>
          ) : filteredCommandes.length > 0 ? (
            <FlatList
              data={filteredCommandes}
              renderItem={renderCommande}
              keyExtractor={(item) => item.id_dmd?.toString() || Math.random().toString()}
              contentContainerStyle={styles.flatListPadding}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState />
          )}
        </View>
      </View>

      {/* FAB */}
      {isClient && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => {
            try {
              navigation.navigate("Formulaire");
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }}
        >
          <MaterialCommunityIcons name="plus" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* NavBar Overlay */}
      <View style={styles.navBarWrapper}>
        <NavBarData navigation={navigation} active_page="hub" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // --- Structural ---
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Slate 50
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // --- Header ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greetingSub: {
    fontSize: 14,
    color: "#64748B", // Slate 500
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 28,
    color: "#0F172A", // Slate 900
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E7FF", // Indigo 100
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4F46E5",
  },

  // --- Feature Banner ---
  featureBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5", // Indigo 600
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  featureSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  // --- Filters ---
  filterSection: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingRight: 20,
    gap: 8,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E2E8F0", // Slate 200
  },
  filterPillActive: {
    backgroundColor: "#0F172A", // Slate 900
    borderColor: "#0F172A",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },

  // --- List & Cards ---
  listContainer: {
    flex: 1,
  },
  flatListPadding: {
    paddingBottom: 120,
    paddingTop: 4,
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(241, 245, 249, 1)",
  },
  statusStrip: {
    height: 6,
    width: "100%",
  },
  cardInner: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cmdId: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cmdTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    maxWidth: width * 0.55,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 16,
  },

  // --- Card Details ---
  detailRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  iconBox: {
    width: 32,
    alignItems: "center",
    justifyContent: "flex-start",
    marginRight: 8,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "600",
    lineHeight: 20,
  },

  // --- Product Preview ---
  productPreviewContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  productPreviewHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
  },
  previewList: {
    gap: 6,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginRight: 8,
  },
  previewText: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
  },
  previewQty: {
    fontWeight: "700",
    color: "#0F172A",
  },
  moreItems: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    marginLeft: 12,
  },

  // --- Card Footer ---
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  viewDetailsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
    marginRight: 6,
  },

  // --- States ---
  loadingState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingLabel: {
    marginTop: 12,
    color: "#94A3B8",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  ctaButton: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  // --- Floating Action Button ---
  fab: {
    position: "absolute",
    right: 20,
    bottom: 100, // Above navbar
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 50,
  },

  // --- Navbar Wrapper ---
  navBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default Hub;
