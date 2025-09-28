import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileManager from '../util/file-manager';
import { debbug_log } from '../util/debbug';

const { width } = Dimensions.get('window');

const CoursierProcessScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [commandData, setCommandData] = useState(null);
  const [fournisseurCode, setFournisseurCode] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [animation] = useState(new Animated.Value(0));

  const item = route?.params?.item || null;

  useEffect(() => {
    fetchCommandData();
  }, []);

  useEffect(() => {
    // Animation when step changes
    Animated.timing(animation, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start(() => {
      animation.setValue(0);
    });
  }, [currentStep]);

  const fetchCommandData = async () => {
    try {
      const userData = await FileManager.read_file("auto.json");
      const session_id = userData.session_id;
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/get_itin_coursier.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({session_id: session_id, id_cmd: item.id_cmd})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();


      const simulatedData = {
        id_public_cmd: item.id_public_cmd,
        fournisseur: {
          prenom: data.prenom_fournisseur,
          organisation: data.orga_fourni,
          code_echange: data.code_echange_fourni,
          localisation: data.localisation_fourni,
          //telephone: "+33 1 23 45 67 89"
        },
        client: {
          nom: data.nom_client,
          organisation: data.orga_client,
          localisation: data.localisation_client,
          code_echange_client: item.localisation_dmd
          //telephone: "+33 1 98 76 54 32"
        },
        produits: [
          item.produits
          /*
          {
            id_produit: 1,
            nom_produit: "Produit A",
            quantite: 2,
            statut: "À récupérer",
            image: "📦"
          },
          {
            id_produit: 2,
            nom_produit: "Produit B",
            quantite: 1,
            statut: "À récupérer",
            image: "📱"
          },
          {
            id_produit: 3,
            nom_produit: "Produit C",
            quantite: 3,
            statut: "À récupérer",
            image: "💻"
          }*/
        ],
        details: {
          nom_dmd: data.nom_dmd,
          date_debut: item.date_debut,
          //instructions: "Fragile - Manipuler avec précaution"
        }
      };

      setCommandData(simulatedData);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de la commande');
      setLoading(false);
    }
  };

  const changeStatusCommand = async(nv_status) => {
    try{
    const response = await("https://backend-logistique-api-latest.onrender.com/change_status.php",{
      method: "POST",
      headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({id_cmd: item.id_cmd, status: nv_status}),
          })

      const result = await response.json();
      debbug_log("== Response API, change status == ", 'cyan');
      debbug_log(result, 'cyan');

    }catch(error){
      debbug_log("An error occured", "red");
    }

  }

  const handleFournisseurCodeSubmit = () => {
    if (!commandData) return;

    if (fournisseurCode === commandData.fournisseur.code_echange) {
      // Mettre à jour le statut des produits
      const updatedData = {
        ...commandData,
        produits: commandData.produits.map(produit => ({
          ...produit,
          statut: "En transit"
        }))
      };
      setCommandData(updatedData);
      setCurrentStep(2);
      changeStatusCommand(1);
      Alert.alert('Succès', 'Code validé! Produits récupérés. Vous pouvez maintenant vous diriger vers le client.');
    } else {
      Alert.alert('Erreur', 'Code incorrect. Veuillez réessayer.');
    }
  };

  const handleClientCodeSubmit = () => {
  if (!commandData) return;

  if (clientCode === commandData.client.code_echange) {
    const updatedData = {
      ...commandData,
      produits: commandData.produits.map(produit => ({
        ...produit,
        statut: "Livré"
      }))
    };
    setCommandData(updatedData);
    setCurrentStep(3);
    changeStatusCommand(2);
    Alert.alert('Succès', 'Commande terminée! Livraison validée.');
  } else {
    Alert.alert('Erreur', 'Code incorrect. Veuillez réessayer.');
  }
};

  const getStepIcon = (stepNumber) => {
    switch(stepNumber) {
      case 1: return "business";
      case 2: return "car";
      case 3: return "person";
      default: return "checkmark-circle";
    }
  };

  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "active";
    return "pending";
  };

  const renderProgressSteps = () => {
    const steps = [
      { title: "Fournisseur", key: 1 },
      { title: "Transport", key: 2 },
      { title: "Client", key: 3 }
    ];

    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          return (
            <View key={step.key} style={styles.stepWrapper}>
              <View style={[styles.stepIcon,
                status === "completed" && styles.stepCompleted,
                status === "active" && styles.stepActive
              ]}>
                <Ionicons
                  name={getStepIcon(step.key)}
                  size={20}
                  color={status === "pending" ? "#ccc" : "#fff"}
                />
              </View>
              <Text style={[
                styles.stepLabel,
                status === "active" && styles.stepLabelActive
              ]}>{step.title}</Text>
              {index < steps.length - 1 && (
                <View style={[styles.stepConnector,
                  (status === "completed" || status === "active") && styles.stepConnectorActive
                ]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderProductFlow = () => {
    return (
      <View style={styles.flowContainer}>
        <View style={styles.flowStep}>
          <View style={styles.flowIcon}>
            <Ionicons name="business" size={24} color="#4A90E2" />
          </View>
          <Text style={styles.flowStepTitle}>Fournisseur</Text>
          <Text numberOfLines={1} style={styles.flowStepText}>{commandData.fournisseur.prenom}</Text>
          <Text numberOfLines={1} style={styles.flowStepSubText}>{commandData.fournisseur.organisation}</Text>
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={24} color="#4A90E2" />
        </View>

        <View style={styles.flowStep}>
          <View style={styles.flowIcon}>
            <Ionicons name="cube" size={24} color="#4A90E2" />
          </View>
          <Text style={styles.flowStepTitle}>Produits</Text>
          {commandData.produits.slice(0, 2).map((produit, index) => (
            <Text key={index} numberOfLines={1} style={styles.productFlowText}>
              {produit.nom_produit} (x{produit.quantite})
            </Text>
          ))}
          {commandData.produits.length > 2 && (
            <Text style={styles.moreProducts}>+{commandData.produits.length - 2} autres</Text>
          )}
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={24} color="#4A90E2" />
        </View>

        <View style={styles.flowStep}>
          <View style={styles.flowIcon}>
            <Ionicons name="person" size={24} color="#4A90E2" />
          </View>
          <Text style={styles.flowStepTitle}>Client</Text>
          <Text numberOfLines={1} style={styles.flowStepText}>{commandData.client.nom}</Text>
          <Text numberOfLines={1} style={styles.flowStepSubText}>{commandData.client.organisation}</Text>
        </View>
      </View>
    );
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <Animated.View style={[styles.stepContent, {
            opacity: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1]
            }),
            transform: [{
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }]}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, styles.stepNumberActive]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepTitleContainer}>
                <Text style={styles.stepTitle}>Chez le fournisseur</Text>
                <Text style={styles.stepSubtitle}>Récupération des produits</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="business" size={20} color="#4A90E2" />
                <Text style={styles.infoTitle}>Informations fournisseur</Text>
              </View>
              <View style={styles.infoContent}>
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={16} color="#666" />
                  <Text style={styles.infoText}>{commandData.fournisseur.prenom}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="business" size={16} color="#666" />
                  <Text style={styles.infoText}>{commandData.fournisseur.organisation}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={16} color="#666" />
                  <Text style={styles.infoText}>{commandData.fournisseur.localisation}</Text>
                </View>

                {/*<View style={styles.infoRow}>
                  <Ionicons name="call" size={16} color="#666" />
                  <Text style={styles.infoText}>{commandData.fournisseur.telephone}</Text>

                </View>*/}
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="cube" size={20} color="#4A90E2" />
                <Text style={styles.infoTitle}>Produits à récupérer</Text>
              </View>
              <View style={styles.infoContent}>
                {commandData.produits.map((produit, index) => (
                  <View key={index} style={styles.productItem}>
                    <Text style={styles.productEmoji}>{produit.image}</Text>
                    <View style={styles.productDetails}>
                      <Text style={styles.productName}>{produit.nom_produit}</Text>
                      <Text style={styles.productQuantity}>Quantité: {produit.quantite}</Text>
                    </View>
                    <View style={[styles.statusBadge, styles.statusPending]}>
                      <Text style={styles.statusText}>{produit.statut}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.codeInputContainer}>
              <Text style={styles.codeLabel}>Code de confirmation fournisseur</Text>
              <TextInput
                style={styles.codeInput}
                placeholder="Entrez le code"
                value={fournisseurCode}
                onChangeText={setFournisseurCode}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.button, !fournisseurCode && styles.buttonDisabled]}
                onPress={handleFournisseurCodeSubmit}
                disabled={!fournisseurCode}
              >
                <Text style={styles.buttonText}>Valider la récupération</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View style={[styles.stepContent, {
            opacity: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1]
            }),
            transform: [{
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }]}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, styles.stepNumberActive]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepTitleContainer}>
                <Text style={styles.stepTitle}>En transit</Text>
                <Text style={styles.stepSubtitle}>Vers le client</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="navigate" size={20} color="#4A90E2" />
                <Text style={styles.infoTitle}>Direction client</Text>
              </View>
              <View style={styles.infoContent}>
                <View style={styles.directionContainer}>
                  <View style={styles.directionRow}>
                    <Ionicons name="location" size={16} color="#4A90E2" />
                    <View>
                      <Text style={styles.directionLabel}>De:</Text>
                      <Text style={styles.directionText}>{commandData.fournisseur.localisation}</Text>
                    </View>
                  </View>

                  <View style={styles.directionSeparator} />

                  <View style={styles.directionRow}>
                    <Ionicons name="flag" size={16} color="#4A90E2" />
                    <View>
                      <Text style={styles.directionLabel}>À:</Text>
                      <Text style={styles.directionText}>{commandData.client.localisation}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="cube" size={20} color="#4A90E2" />
                <Text style={styles.infoTitle}>Produits en transit</Text>
              </View>
              <View style={styles.infoContent}>
                {commandData.produits.map((produit, index) => (
                  <View key={index} style={styles.productItem}>
                    <Text style={styles.productEmoji}>{produit.image}</Text>
                    <View style={styles.productDetails}>
                      <Text style={styles.productName}>{produit.nom_produit}</Text>
                      <Text style={styles.productQuantity}>Quantité: {produit.quantite}</Text>
                    </View>
                    <View style={[styles.statusBadge, styles.statusTransit]}>
                      <Text style={styles.statusText}>{produit.statut}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setCurrentStep(2.5)}
            >
              <Text style={styles.buttonText}>J'arrive chez le client</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case 2.5:
      case 3:
        return (
          <Animated.View style={[styles.stepContent, {
            opacity: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1]
            }),
            transform: [{
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }]}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, currentStep === 3 ? styles.stepNumberCompleted : styles.stepNumberActive]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepTitleContainer}>
                <Text style={styles.stepTitle}>Chez le client</Text>
                <Text style={styles.stepSubtitle}>
                  {currentStep === 3 ? "Livraison terminée" : "Remise des produits"}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="person" size={20} color="#4A90E2" />
                <Text style={styles.infoTitle}>Informations client</Text>
              </View>
              <View style={styles.infoContent}>
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={16} color="#666" />
                  <Text style={styles.infoText}>{commandData.client.nom}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="business" size={16} color="#666" />
                  <Text style={styles.infoText}>{commandData.client.organisation}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={16} color="#666" />
                  <Text style={styles.infoText}>{commandData.client.localisation}</Text>
                </View>
                {/*}
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={16} color="#666" />
                  <Text style={styles.infoText}>{commandData.client.telephone}</Text>
                </View>*/}
              </View>
            </View>

            {currentStep === 2.5 ? (
              <View style={styles.codeInputContainer}>
                <Text style={styles.codeLabel}>Code de confirmation client</Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="Entrez le code"
                  value={clientCode}
                  onChangeText={setClientCode}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[styles.button, !clientCode && styles.buttonDisabled]}
                  onPress={handleClientCodeSubmit}
                  disabled={!clientCode}
                >
                  <Text style={styles.buttonText}>Valider la livraison</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.completedContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                </View>
                <Text style={styles.completedTitle}>Livraison terminée avec succès!</Text>
                <Text style={styles.completedText}>Tous les produits ont été livrés au client.</Text>

                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="list" size={20} color="#4A90E2" />
                    <Text style={styles.infoTitle}>Produits livrés</Text>
                  </View>
                  <View style={styles.infoContent}>
                    {commandData.produits.map((produit, index) => (
                      <View key={index} style={styles.productItem}>
                        <Text style={styles.productEmoji}>{produit.image}</Text>
                        <View style={styles.productDetails}>
                          <Text style={styles.productName}>{produit.nom_produit}</Text>
                          <Text style={styles.productQuantity}>Quantité: {produit.quantite}</Text>
                        </View>
                        <View style={[styles.statusBadge, styles.statusDelivered]}>
                          <Text style={styles.statusText}>{produit.statut}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.buttonText}>Retour à l'accueil</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Chargement des données de la commande...</Text>
      </View>
    );
  }

  if (!commandData) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={50} color="#ccc" />
        <Text style={styles.errorText}>Aucune donnée de commande disponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Processus de Livraison</Text>
        <Text style={styles.subtitle}>Commande: {commandData.id_public_cmd}</Text>

        {renderProgressSteps()}
        {renderProductFlow()}
        {renderStepContent()}
      </ScrollView>
    </View>
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
    padding: 16,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 2,
  },
  stepActive: {
    backgroundColor: '#4A90E2',
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepLabel: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  stepConnector: {
    position: 'absolute',
    top: 20,
    left: '60%',
    right: '-60%',
    height: 2,
    backgroundColor: '#e0e0e0',
    zIndex: 1,
  },
  stepConnectorActive: {
    backgroundColor: '#4CAF50',
  },
  flowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flowStep: {
    flex: 1,
    alignItems: 'center',
  },
  flowIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  flowStepTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
  },
  flowStepText: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '600',
  },
  flowStepSubText: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  productFlowText: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 2,
  },
  moreProducts: {
    fontSize: 10,
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  arrowContainer: {
    paddingHorizontal: 5,
  },
  stepContent: {
    marginBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberActive: {
    backgroundColor: '#4A90E2',
  },
  stepNumberCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepTitleContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
    paddingBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  infoContent: {
    // Additional content styling if needed
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 8,
    color: '#34495e',
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  productEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FFEBC8',
  },
  statusTransit: {
    backgroundColor: '#D6E4FF',
  },
  statusDelivered: {
    backgroundColor: '#D5F5E3',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  codeInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  directionContainer: {
    // Styling for direction container
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  directionLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 8,
    marginBottom: 2,
  },
  directionText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
  },
  directionSeparator: {
    height: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    marginLeft: 8,
    marginVertical: 4,
  },
  completedContainer: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default CoursierProcessScreen;
