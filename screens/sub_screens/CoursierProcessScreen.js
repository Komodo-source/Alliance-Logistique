import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';

const CoursierProcessScreen = () => {
  const [loading, setLoading] = useState(true);
  const [commandData, setCommandData] = useState(null);
  const [fournisseurCode, setFournisseurCode] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: chez fournisseur, 2: en route, 3: chez client

  // Simulation de la récupération des données depuis l'API
  useEffect(() => {
    fetchCommandData();
  }, []);

  const fetchCommandData = async () => {
    try {
      // En réalité, vous utiliseriez votre endpoint API ici
      // const response = await fetch('votre_api_endpoint', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     session_id: 'votre_session_id',
      //     id_cmd: 'id_de_la_commande'
      //   })
      // });
      // const data = await response.json();

      // Simulation des données de réponse
      const simulatedData = [
        {
          id_produit: 1,
          nom_produit: "Produit A",
          id_public_cmd: "CMD12345",
          id_fournisseur: 456,
          prenom_fournisseur: "Jean",
          code_echange: "CODE123",
          nb_produit: 2,
          id_client: 789,
          nom_client: "Dupont",
          nom_dmd: "Livraison urgente",
          date_debut: "2023-05-15 10:00:00",
          localisation_dmd: "12 Rue du Commerce, Paris",
          localisation_client: "12 Rue du Commerce, Paris",
          orga_client: "Société Dupont",
          orga_fourni: "Fournisseur Jean"
        },
        {
          id_produit: 2,
          nom_produit: "Produit B",
          id_public_cmd: "CMD12345",
          id_fournisseur: 456,
          prenom_fournisseur: "Jean",
          code_echange: "CODE123",
          nb_produit: 1,
          id_client: 789,
          nom_client: "Dupont",
          nom_dmd: "Livraison urgente",
          date_debut: "2023-05-15 10:00:00",
          localisation_dmd: "12 Rue du Commerce, Paris",
          localisation_client: "12 Rue du Commerce, Paris",
          orga_client: "Société Dupont",
          orga_fourni: "Fournisseur Jean"
        }
      ];

      setCommandData(simulatedData);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de la commande');
      setLoading(false);
    }
  };

  const handleFournisseurCodeSubmit = () => {
    if (!commandData || commandData.length === 0) return;

    const expectedCode = commandData[0].code_echange;
    if (fournisseurCode === expectedCode) {
      setCurrentStep(2);
      Alert.alert('Succès', 'Code validé! Vous pouvez maintenant vous diriger vers le client.');
    } else {
      Alert.alert('Erreur', 'Code incorrect. Veuillez réessayer.');
    }
  };

  const handleClientCodeSubmit = () => {
    if (!commandData || commandData.length === 0) return;

    const expectedCode = commandData[0].code_echange;
    if (clientCode === expectedCode) {
      setCurrentStep(3);
      Alert.alert('Succès', 'Commande terminée! Livraison validée.');
    } else {
      Alert.alert('Erreur', 'Code incorrect. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement des données de la commande...</Text>
      </View>
    );
  }

  if (!commandData) {
    return (
      <View style={styles.centered}>
        <Text>Aucune donnée de commande disponible</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Processus de Livraison</Text>

      {/* Étape 1: Chez le fournisseur */}
      <View style={[styles.stepContainer, currentStep >= 1 && styles.activeStep]}>
        <Text style={styles.stepTitle}>Étape 1: Chez le fournisseur</Text>
        <Text>Fournisseur: {commandData[0].prenom_fournisseur}</Text>
        <Text>Organisation: {commandData[0].orga_fourni}</Text>

        <Text style={styles.sectionTitle}>Produits à récupérer:</Text>
        {commandData.map((item, index) => (
          <View key={index} style={styles.productItem}>
            <Text>- {item.nom_produit} (x{item.nb_produit})</Text>
          </View>
        ))}

        {currentStep === 1 && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Code du fournisseur"
              value={fournisseurCode}
              onChangeText={setFournisseurCode}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleFournisseurCodeSubmit}
            >
              <Text style={styles.buttonText}>Valider le code</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Étape 2: En route vers le client */}
      <View style={[styles.stepContainer, currentStep >= 2 && styles.activeStep]}>
        <Text style={styles.stepTitle}>Étape 2: En route vers le client</Text>
        <Text>Client: {commandData[0].nom_client}</Text>
        <Text>Adresse: {commandData[0].localisation_client}</Text>
        <Text>Organisation: {commandData[0].orga_client}</Text>

        {currentStep === 2 && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCurrentStep(2.5)} // Simuler l'arrivée chez le client
          >
            <Text style={styles.buttonText}>Je suis arrivé chez le client</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Étape 3: Chez le client */}
      {(currentStep === 2.5 || currentStep === 3) && (
        <View style={[styles.stepContainer, currentStep === 3 && styles.completedStep]}>
          <Text style={styles.stepTitle}>Étape 3: Chez le client</Text>
          <Text>Client: {commandData[0].nom_client}</Text>
          <Text>Adresse: {commandData[0].localisation_client}</Text>

          {currentStep === 2.5 && (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Code du client"
                value={clientCode}
                onChangeText={setClientCode}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleClientCodeSubmit}
              >
                <Text style={styles.buttonText}>Valider le code client</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.completedContainer}>
              <Text style={styles.completedText}>✅ Commande terminée avec succès!</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeStep: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  completedStep: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  productItem: {
    marginLeft: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  completedContainer: {
    alignItems: 'center',
    padding: 10,
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default CoursierProcessScreen;
