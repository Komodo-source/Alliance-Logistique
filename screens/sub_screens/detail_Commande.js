import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView, Alert, Platform } from 'react-native';

import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import LeafletMap from '../../components/LeafletMap';
import * as fileManager from '../util/file-manager.js';
import { debbug_log } from '../util/debbug.js';
import { getAlertRef } from '../util/AlertService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { openNavigationWithChoice  }  from "../util/Polyvalent.js";
import { loadImages } from '../util/ReferenceImage.js';

var headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const DetailCommande = ({ route, navigation }) => {
  const item = route && route.params && route.params.item ? route.params.item : null;
  const [region, setRegion] = useState({
    latitude: 9.3077,
    longitude: 2.3158,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.822,
  });

  // Ensure region is always valid
  const safeRegion = {
    latitude: region.latitude || 9.3077,
    longitude: region.longitude || 2.3158,
    latitudeDelta: region.latitudeDelta || 0.0421,
    longitudeDelta: region.longitudeDelta || 0.822,
  };
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [prix, calculPrix] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [mapInteracting, setMapInteracting] = useState(false);
  const [isAdresse, setIsAddresse] = useState(false);
  const [typeUser, setTypeUser] = useState('');
  const [addresse, setAddress] = useState("");
  const [email, setEmail] = useState("");

  if (!item) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#fff'}}>
        <Text style={{color:'#2E3192', fontSize:18, fontWeight:'bold'}}>Aucune donnée de commande trouvée.</Text>
        <TouchableOpacity
          style={{marginTop:20, backgroundColor:'#2E3192', padding:12, borderRadius:8}}
          onPress={() => {
            try {
              if (navigation && navigation.goBack) {
                navigation.goBack();
              }
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
        >
          <Text style={{color:'#fff'}}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const calcul = (itemProduit) => {
    let prix = 0;
    if (itemProduit && Array.isArray(itemProduit)) {
      for (let i = 0; i < itemProduit.length; i++) {
        prix += (itemProduit[i].prix || 0) * (itemProduit[i].quantite || 1);
      }
    }
    return prix;
  };

  const showSavedPDFs = async () => {
    try {
      let downloadDir;

      if (Platform.OS === 'android') {
        // For Android, check both document directory and Downloads
        downloadDir = `${FileSystem.documentDirectory}Download/`;
      } else {
        // For iOS, use document directory
        downloadDir = FileSystem.documentDirectory;
      }

      // Check if directory exists
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        Alert.alert('Aucun PDF', 'Aucun dossier de téléchargement trouvé.');
        return;
      }

      const files = await FileSystem.readDirectoryAsync(downloadDir);
      const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

      if (pdfFiles.length === 0) {
        Alert.alert('Aucun PDF', 'Aucun fichier PDF trouvé dans le dossier de téléchargement.');
        return;
      }

      const fileList = pdfFiles.map((file, index) => `${index + 1}. ${file}`).join('\n');

      Alert.alert('PDFs Sauvegardés', fileList, [
        { text: 'OK' },
        {
          text: 'Ouvrir dossier',
          onPress: () => {
            if (Platform.OS === 'android') {
              // On Android, you might want to use an intent to open file manager
              Alert.alert('Info', `Les fichiers sont dans: ${downloadDir}`);
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Error reading directory:', error);
      Alert.alert('Erreur', 'Impossible de lire le dossier de téléchargement.');
    }
  };

  const createAndSavePDF = async () => {
    console.log('Generating and saving PDF...');

    if (isGenerating) return; // Prevent multiple calls

    setIsGenerating(true);

    try {
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `Facture_${item.id_public_cmd || 'N_A'}_${timestamp}.pdf`;

      // Calculate totals
      const totalHT = prix * 0.82; // 18% TVA means HT = TTC / 1.18 ≈ TTC * 0.82
      const tva = prix * 0.18;

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Facture n°${item.id_public_cmd}</title>
          <style>
              * {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }

              body {
                  padding: 30px;
                  line-height: 1.6;
                  color: #333;
                  background-color: #fff;
              }

              .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 40px;
                  border-bottom: 3px solid #2E3192;
                  padding-bottom: 20px;
              }

              .header h1 {
                  font-size: 42px;
                  color: #2E3192;
                  font-weight: bold;
              }

              .invoice-info {
                  text-align: right;
              }

              .invoice-info h2 {
                  font-size: 16px;
                  color: #666;
                  margin-bottom: 5px;
              }

              .company-info {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 40px;
              }

              .company-section {
                  flex: 1;
                  padding: 20px;
                  background-color: #f8f9fa;
                  margin: 0 10px;
                  border-radius: 8px;
              }

              .company-section:first-child {
                  margin-left: 0;
              }

              .company-section:last-child {
                  margin-right: 0;
              }

              .company-section h3 {
                  font-size: 18px;
                  margin-bottom: 15px;
                  color: #2E3192;
                  border-bottom: 2px solid #2E3192;
                  padding-bottom: 5px;
              }

              .company-section p {
                  font-size: 14px;
                  color: #666;
                  margin-bottom: 8px;
              }

              .products-section {
                  margin-bottom: 40px;
              }

              .products-section h3 {
                  font-size: 20px;
                  margin-bottom: 20px;
                  color: #2E3192;
              }

              .products-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }

              .products-table th {
                  background-color: #2E3192;
                  color: white;
                  padding: 15px;
                  text-align: left;
                  font-weight: bold;
                  font-size: 14px;
              }

              .products-table td {
                  border: 1px solid #ddd;
                  padding: 12px 15px;
                  font-size: 14px;
              }

              .products-table tr:nth-child(even) {
                  background-color: #f8f9fa;
              }

              .products-table tr:hover {
                  background-color: #e8f0fe;
              }

              .totals-section {
                  margin-top: 40px;
                  padding: 20px;
                  background-color: #f8f9fa;
                  border-radius: 8px;
                  border-left: 5px solid #2E3192;
              }

              .total-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 10px;
                  padding: 5px 0;
              }

              .total-row.final {
                  border-top: 2px solid #2E3192;
                  padding-top: 15px;
                  margin-top: 15px;
                  font-weight: bold;
                  font-size: 18px;
                  color: #2E3192;
              }

              .total-label {
                  font-size: 16px;
                  color: #333;
              }

              .total-value {
                  font-size: 16px;
                  font-weight: bold;
                  color: #2E3192;
              }

              .footer {
                  margin-top: 60px;
                  text-align: center;
                  padding-top: 20px;
                  border-top: 1px solid #ddd;
                  color: #666;
                  font-size: 12px;
              }

              @media print {
                  body { padding: 20px; }
                  .header h1 { font-size: 36px; }
                  .products-table { page-break-inside: avoid; }
              }
          </style>
      </head>
      <body>
          <div class="header">
              <div>
                  <h1>FACTURE</h1>
              </div>
              <div class="invoice-info">
                  <h2>Date: ${new Date().toLocaleDateString('fr-FR')}</h2>
                  <h2>FACTURE N°: ${item.id_public_cmd || 'N/A'}</h2>
              </div>
          </div>

          <div class="company-info">
              <div class="company-section">
                  <h3>ÉMETTEUR</h3>
                  <p><strong>Alliance Logistique</strong></p>
                  <p>Dekougnbe Parcelle I</p>
                  <p>8eme Von Droite après rond point pavé Dekougnbe</p>
                  <p>Email: support@alliance-logistique.com</p>
                  <p>Tél: +229 96 49 12 89</p>
              </div>

              <div class="company-section">
                  <h3>DESTINATAIRE</h3>
                  <p><strong>${item.nom_dmd || 'Client'}</strong></p>

                  <p>Email: ${email || "pas d'adresse email"}</p>
                  <p>Code commande: ${item.id_public_cmd || 'N/A'}</p>
              </div>
          </div>

          <div class="products-section">
              <h3>Détail des Produits</h3>
              <table class="products-table">
                  <thead>
                      <tr>
                          <th>Désignation</th>
                          <th>Prix Unitaire (FCFA)</th>
                          <th>Quantité</th>
                          <th>Total HT (FCFA)</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${item.produits && item.produits.length > 0
                        ? item.produits.map(produit => {
                            const prixUnitaire = produit.prix || 0;
                            const quantite = produit.quantite || 1;
                            const totalProduit = prixUnitaire * quantite;
                            return `
                            <tr>
                                <td>${produit.nom_produit || produit.libelle || 'Produit'}</td>
                                <td>${prixUnitaire.toLocaleString('fr-FR')}</td>
                                <td>${quantite}</td>
                                <td>${totalProduit.toLocaleString('fr-FR')}</td>
                            </tr>
                            `;
                          }).join('')
                        : '<tr><td colspan="4" style="text-align: center; color: #666;">Aucun produit disponible</td></tr>'
                      }
                  </tbody>
              </table>
          </div>

          <div class="totals-section">
              <div class="total-row">
                  <span class="total-label">Total HT:</span>
                  <span class="total-value">${totalHT.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA</span>
              </div>
              <div class="total-row">
                  <span class="total-label">TVA (18%):</span>
                  <span class="total-value">${tva.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA</span>
              </div>
              <div class="total-row final">
                  <span class="total-label">Total TTC:</span>
                  <span class="total-value">${prix.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA</span>
              </div>
          </div>

          <div class="footer">
              <p>Merci de votre confiance | Alliance Logistique</p>
              <p>Cette facture est générée automatiquement</p>
          </div>
      </body>
      </html>
      `;

      // Generate PDF
      const { uri } = await printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612,
        height: 792,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        }
      });

      console.log('PDF generated at temp location:', uri);

      // Determine save location based on platform
      let finalPath;

      if (Platform.OS === 'android') {
        // For Android, try to save to Downloads folder
        const downloadDir = `${FileSystem.documentDirectory}Download/`;

        // Create Download directory if it doesn't exist
        const downloadDirInfo = await FileSystem.getInfoAsync(downloadDir);
        if (!downloadDirInfo.exists) {
          await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
        }

        finalPath = `${downloadDir}${fileName}`;
      } else {
        // For iOS, save to document directory
        finalPath = `${FileSystem.documentDirectory}${fileName}`;
      }

      // Copy PDF to final location
      await FileSystem.copyAsync({
        from: uri,
        to: finalPath
      });

      console.log('PDF copied to:', finalPath);

      // Try to save to Media Library for better accessibility
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const asset = await MediaLibrary.createAssetAsync(uri);
          const album = await MediaLibrary.getAlbumAsync('Factures');
          if (album == null) {
            await MediaLibrary.createAlbumAsync('Factures', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
          console.log('PDF saved to Media Library');
        }
      } catch (mediaError) {
        console.log('Could not save to Media Library:', mediaError.message);
        // Not critical, continue without Media Library
      }

      // Show success alert with sharing option
      Alert.alert(
        'PDF Généré avec succès!',
        `Le fichier "${fileName}" a été sauvegardé.\n\nEmplacement: ${finalPath}`,
        [
          { text: 'OK' },
          {
            text: 'Partager',
            onPress: async () => {
              try {
                const canShare = await Sharing.isAvailableAsync();
                if (canShare) {
                  await Sharing.shareAsync(finalPath, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Partager la facture'
                  });
                } else {
                  Alert.alert('Info', 'Le partage n\'est pas disponible sur cet appareil');
                }
              } catch (shareError) {
                console.error('Share error:', shareError);
                Alert.alert('Erreur', 'Impossible de partager le fichier');
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('PDF generation/saving error:', error);
      Alert.alert(
        'Erreur',
        `Erreur lors de la génération du PDF: ${error.message}\n\nVeuillez réessayer.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    getType();
    try {
      if (item && item.produits) {
        calculPrix(calcul(item.produits));
      }
      if ([...item.localisation_dmd].some(char => /[a-zA-Z]/.test(char))){ //check si il y a une lettre
        //donc si c'est une addresse
        setIsAddresse(true);
      }else{
          if (item && item.localisation_dmd && typeof item.localisation_dmd === 'string') {
            const coords = item.localisation_dmd.split(';');
            if (coords.length >= 2) {
              const lat = parseFloat(coords[0]);
              const lng = parseFloat(coords[1]);

              if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                setSelectedLocation({
                  latitude: lat,
                  longitude: lng,
                });
                // Update map region to center on the location
                setRegion(prev => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }));
              }
            }
          }
        }
        debbug_log("=== item ===", 'cyan');
        debbug_log(JSON.stringify(item), 'cyan');
      }
       catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, [item]);

  const getType = async() => {
    const Type = await fileManager.read_file("auto.json");
    setTypeUser(Type.type);
    debbug_log("=== type: " + Type.type + " ===", "cyan");
  }

  const zoomOut = () => {
    setRegion(prev => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 1.2,
      longitudeDelta: prev.longitudeDelta * 1.2
    }));
  };

  const zoomIn = () => {
    setRegion(prev => ({
      ...prev,
      latitudeDelta: Math.max(prev.latitudeDelta * 0.8, 0.0001),
      longitudeDelta: Math.max(prev.longitudeDelta * 0.8, 0.0001)
    }));
  };

  const dic_status = {
    1: "Livraison en cours",
    2: "Livré",
    3: "En cours de préparation"
  }

  const dic_status_color = {
    1: "#FFA726",
    2: "#0a75d3",
    3: "#06bd09"
  }

  const renderStatusBadge = () => {
    // Add null checks to prevent crashes
    if (!item || !item.id_status) {
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#666666" }]}>
          <Text style={styles.statusText}>N/A</Text>
        </View>
      );
    }

    const statusColor = dic_status_color[item.id_status] || "#666666";
    const statusText = dic_status[item.id_status] || "Unknown";

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    );
  };

  const renderPaymentBadge = () => {
    if (!item) return null;

    const isPaid = item.est_paye === true || item.est_paye === 1;
    const paymentColor = isPaid ? "#06bd09" : "#FFA726";
    const paymentText = isPaid ? "Payé" : "Non payé";
    const paymentIcon = isPaid ? "✓" : "⏳";

    return (
      <View style={[styles.paymentBadge, { backgroundColor: paymentColor }]}>
        <Text style={styles.paymentIcon}>{paymentIcon}</Text>
        <Text style={styles.paymentText}>{paymentText}</Text>
      </View>
    );
  };

  const renderPaymentInfo = () => {
    if (!item || !item.est_paye) return null;

    return (
      <View style={styles.paymentInfoSection}>
        <Text style={styles.paymentInfoTitle}>Informations de paiement</Text>
        <View style={styles.paymentInfoRow}>
          <Text style={styles.paymentInfoLabel}>Montant payé:</Text>
          <Text style={styles.paymentInfoValue}>
            {item.montant_paye ? `${item.montant_paye} FCFA` : 'N/A'}
          </Text>
        </View>
        <View style={styles.paymentInfoRow}>
          <Text style={styles.paymentInfoLabel}>Numéro MoMo:</Text>
          <Text style={styles.paymentInfoValue}>
            {item.momo_number || 'N/A'}
          </Text>
        </View>
        <View style={styles.paymentInfoRow}>
          <Text style={styles.paymentInfoLabel}>Date de paiement:</Text>
          <Text style={styles.paymentInfoValue}>
            {item.date_payement ? new Date(item.date_payement).toLocaleDateString('fr-FR') : 'N/A'}
          </Text>
        </View>
      </View>
    );
  };

  const shorten_localisation_data = (data) => {
    if (isAdresse){
      return data;
    }else{
      if (!data || typeof data !== 'string') return 'N/A';
      const parts = data.split(';');
      if (parts.length < 2) return 'N/A';
      return parts[0].slice(0, 8) + ', ' + parts[1].slice(0, 8);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} scrollEnabled={!mapInteracting}>
        <View style={styles.main}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>{item.nom_dmd || 'Commande'}</Text>
            <Text style={styles.subtitle}>{item.desc_dmd || 'Description non disponible'}</Text>
            <View style={styles.badgesContainer}>
              {renderStatusBadge()}
              {typeUser === "client" ? renderPaymentBadge() : null}
            </View>
          </View>

          <View style={styles.container}>
            {typeUser === "client" ? (
              <View style={styles.card}>
                <Text style={styles.title}>Obtenir votre code client</Text>
                <Text style={styles.description}>Ce code servira à confirmer votre identité</Text>
                <TouchableOpacity style={[styles.button, styles.clientButton]}
                onPress={() => {getAlertRef().current?.showAlert(
                     'Code Personnel',
                     'Votre code client est: '+ item.code_echange + '\n\n(Vous ne devez donner ce code qu\'à votre couriser)',
                     true,
                     "OK",
                     null
                 )}}>
                  <Text style={styles.buttonText}>Obtenir Code</Text>
                </TouchableOpacity>
              </View>
            ) : typeUser === "fournisseur" ? (
              <View style={styles.card}>
                <Text style={styles.title}>Obtenir votre code fournisseur</Text>
                <Text style={styles.description}>Ce code servira à confirmer votre identité</Text>
                <TouchableOpacity style={[styles.button, styles.providerButton]}
                onPress={() => {getAlertRef().current?.showAlert(
                     'Code Personnel',
                     'Votre code fournisseur est: '+ item.code_echange_fourni + '\n\n(Vous ne devez donner ce code qu\'à votre couriser)',
                     true,
                     "OK",
                     null
                 )}}>
                  <Text style={styles.buttonText}>Obtenir Code</Text>
                </TouchableOpacity>
              </View>
            ) : typeUser === "coursier" ? (
              // MODIFIED LOGIC FOR COURSIER (COURIER)
              item.id_status === 2 ? (
                <View style={[styles.card, styles.deliveredCard]}>
                  <MaterialCommunityIcons name="check-circle" size={30} color="#06bd09" style={{ marginBottom: 10 }} />
                  <Text style={styles.title}>Commande Livrée</Text>
                  <Text style={styles.description}>Cette commande a déjà été livrée et finalisée.</Text>
                </View>
              ) : (
                <View style={styles.card}>
                  <Text style={styles.title}>Information sur la course</Text>
                  <Text style={styles.description}>Consultez les détails de cette livraison</Text>
                  <TouchableOpacity style={[styles.button, styles.courierButton]}
                  onPress={() => {navigation.navigate("CoursierProcessScreen", {item})}}>
                    <Text style={[styles.buttonText, {color: "#FFF"}]}>Voir les détails</Text>
                  </TouchableOpacity>
                </View>
              )
            ): null}
          </View>

          {/* Order Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#2E3192" />
              <Text style={styles.infoText}>Date de livraison: <Text style={styles.infoValue}>{item.date_fin || 'N/A'}</Text></Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="receipt" size={20} color="#2E3192" />
              <Text style={styles.infoText}>Bon de commande: <Text style={styles.infoValue}>{item.id_public_cmd || 'N/A'}</Text></Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="map-marker" size={20} color="#2E3192" />
              <Text style={styles.infoText}>Lieu de livraison: <Text style={styles.infoValue}>{shorten_localisation_data(item.localisation_dmd)}</Text></Text>
            </View>
            {typeUser != "coursier" ? (
            <View style={styles.infoRow}>
              <FontAwesome name="qrcode" size={20} color="#2E3192" />
              <Text style={styles.infoText}>Code de commande: <Text style={styles.infoValue}>{(typeUser === "client" ?  item.code_echange : item.code_echange_fourni) || 'Code Introuvable'}</Text></Text>
            </View>): null}
          </View>


          {/* Payment Info Section */}
          {renderPaymentInfo()}

          {/* Map Section */}
          {isAdresse ? (
            <View style={styles.addr_container}>
              <Text style={styles.addr_title}>Adresse de livraison: </Text>
              <Text style={styles.addr_text}>{item.localisation_dmd}</Text>
            </View>
          ): <View style={styles.mapContainer}>
          <LeafletMap
            latitude={selectedLocation?.latitude || region.latitude}
            longitude={selectedLocation?.longitude || region.longitude}
            selectable={false}
            onMapTouchStart={() => setMapInteracting(true)}
            onMapTouchEnd={() => setMapInteracting(false)}
          />
          {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesText}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>
        }


          {/* Products Section */}
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Produits Achetés</Text>

            {item.produits && Array.isArray(item.produits) && item.produits.length > 0 ? (
              item.produits.map((produit, index) => (
                <View key={index} style={styles.productItem}>
                  <Image
                    source={{uri: loadImages(produit.id_produit?.toString())}}
                    style={styles.productImage}
                  />
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{produit.nom_produit || 'Produit inconnu'}</Text>
                    <View style={styles.productMeta}>
                      <Text style={styles.productQuantity}>Qté: {produit.quantite || 1}</Text>

                      <Text style={styles.productPrice}>{((produit.prix || 0) * (produit.quantite || 1)).toLocaleString('fr-FR')} FCFA</Text>
                    </View>
                    <Text style={styles.productType}>{produit.prix || 0} FCFA/{produit.type_vendu || ''}</Text>

                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noProductsText}>Aucun produit trouvé</Text>
            )}
          </View>

          {/* Total Price Section */}
          <View style={[styles.totalSection, , { marginBottom: 20 }]}>
            <Text style={styles.totalLabel}>Total TTC:</Text>
            <Text style={styles.totalPrice}>{prix.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer]}>
        {typeUser === "client" && (!item.est_paye || item.est_paye === 0) ? (
          <View>
          {typeUser === "fournisseur" || typeUser === "client" ? (
            <TouchableOpacity
              style={[
                styles.invoiceButton,
                isGenerating && { opacity: 0.7 }
              ]}
              onPress={createAndSavePDF}
              disabled={isGenerating}
            >
              <MaterialIcons name="picture-as-pdf" size={24} color="white" />
              <Text style={styles.invoiceButtonText}>
                {isGenerating ? 'Génération en cours...' : 'Générer Facture PDF'}
              </Text>
            </TouchableOpacity>
      ): null}
          <TouchableOpacity
            style={[
              styles.invoiceButton,
              isPaying && { opacity: 0.7 },
              { backgroundColor: "#44c509", marginTop: 10 }
            ]}
            onPress={() =>
              navigation.navigate("payement", { command_data: item, amount: prix })
            }
            disabled={isPaying}
          >
            <MaterialIcons name="attach-money" size={24} color="white" />
            <Text style={styles.invoiceButtonText}>
              {isPaying ? "Paiement en cours..." : "Payer la commande"}
            </Text>
          </TouchableOpacity>
          </View>
        ) : typeUser === "coursier" && item.id_status !== 2? (
          <TouchableOpacity
            style={[
              styles.invoiceButton,
              isPaying && { opacity: 0.7 },
              { backgroundColor: "#fa0985ff", marginTop: 10 }
            ]}
            onPress={() => {navigation.navigate("CoursierProcessScreen", {item})}}
          >
            <MaterialCommunityIcons name="truck-fast-outline" size={30} color="white" />
            <Text style={styles.invoiceButtonText}>
              Information sur la course
            </Text>
          </TouchableOpacity>
        ) : null}

        {(typeUser === "client" && (item.est_paye === true || item.est_paye === 1)) && (
          <View style={styles.paidMessage}>
            <MaterialIcons name="check-circle" size={24} color="#06bd09" />
            <Text style={styles.paidMessageText}>Commande payée</Text>
          </View>
        )}
        {/*
        <TouchableOpacity
          style={[styles.invoiceButton, styles.secondaryButton]}
          onPress={showSavedPDFs}
        >
          <MaterialIcons name="folder" size={24} color="#2E3192" />
          <Text style={[styles.invoiceButtonText, { color: '#2E3192' }]}>
            Voir PDFs Sauvegardés
          </Text>
        </TouchableOpacity>*/}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  addr_title : {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  addr_text : {
    padding: 10,
    backgroundColor: '#c1c6bf',
    borderRadius: 7,
    textAlign: 'center',
    marginTop: 10,
    width: '90%',
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  main: {
    padding: 20,
    paddingBottom: 140, // Increased to accommodate two buttons
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  statusBadge: {
    alignSelf: 'flex-start',

    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  paymentIcon: {
    fontSize: 16,
    marginRight: 5,
    color: 'white',
  },
  paymentText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  paymentInfoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentInfoLabel: {
    fontSize: 15,
    color: '#34495e',
  },
  paymentInfoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
  },
  paidMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  paidMessageText: {
    color: '#06bd09',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#34495e',
    marginLeft: 10,
    flex: 1,
  },
  infoValue: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eaeaea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  mapControlsContainer: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lastMapControlButton: {
    borderBottomWidth: 0,
  },
  mapControlText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3192',
  },
  coordinatesContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#34495e',
  },
  productsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },

  productItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productQuantity: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 10,
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productType: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 10,
    marginTop: 10
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
    marginLeft: 'auto',
  },
  noProductsText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3192',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  invoiceButton: {
    backgroundColor: '#2E3192',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    marginTop: 10,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  clientButton: {
    backgroundColor: '#06C167', // Uber Eats green
  },
  providerButton: {
    backgroundColor: '#3D3DDB', // Uber purple
  },
  courierButton: {
    backgroundColor: '#000000', // Uber black
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    marginBottom: 55,
    borderColor: "#111",
    borderWidth: 2
  },
  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  deliveredCard: {
  backgroundColor: '#e8f5e9', // Light green background for delivered status
  borderColor: '#06bd09',
  borderWidth: 1,
  alignItems: 'center',
},
});

export default DetailCommande;
