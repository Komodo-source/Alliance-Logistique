import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';

const { width } = Dimensions.get('window');

// Theme Colors
const COLORS = {
  darkBg: '#121212',
  cardBg: '#1E1E1E',
  gold: '#FFD700',
  goldDim: 'rgba(255, 215, 0, 0.15)',
  white: '#FFFFFF',
  gray: '#A0A0A0',
  success: '#4CAF50',
  buttonText: '#000000'
};

export default function PremiumPage({ navigation }) {
  // Animation State
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Selection State (Default to Yearly for upsell)
  const [selectedPlan, setSelectedPlan] = useState('yearly'); // 'monthly' or 'yearly'

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubscribe = () => {
    // Handle subscription logic here
    console.log(`User selected ${selectedPlan} and clicked subscribe`);
  };

  const FeatureItem = ({ text }) => (
    <View style={styles.featureRow}>
      <View style={styles.iconContainer}>
        <Text style={styles.checkIcon}>✓</Text>
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBg} />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PREMIUM</Text>
            </View>
            <Text style={styles.title}>Alliance <Text style={styles.goldText}>Plus</Text></Text>
            <Text style={styles.subtitle}>
              Boostez votre activité au niveau National et débloquez votre potentiel.
            </Text>
          </View>

          {/* Pricing Cards Section */}
          <View style={styles.pricingContainer}>
            {/* Monthly Option */}
            <TouchableOpacity
              style={[styles.planCard, selectedPlan === 'monthly' && styles.selectedCard]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.9}
            >
              <Text style={styles.planTitle}>Mensuel</Text>
              <Text style={styles.price}>500 FCFA<Text style={styles.period}>/mois</Text></Text>
            </TouchableOpacity>

            {/* Yearly Option - Highlighted */}
            <TouchableOpacity
              style={[styles.planCard, selectedPlan === 'yearly' && styles.selectedCard]}
              onPress={() => setSelectedPlan('yearly')}
              activeOpacity={0.9}
            >
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>MEILLEURE OFFRE</Text>
              </View>
              <Text style={styles.planTitle}>Annuel</Text>
              <Text style={styles.price}>6000 FCFA<Text style={styles.period}>/an</Text></Text>
            </TouchableOpacity>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Avantages Exclusifs</Text>
            <FeatureItem text="Mise en avant sur la page principale" />
            <FeatureItem text="Possibilité de vente au niveau National" />
            <FeatureItem text="Bonus pour un niveau de vente élevé" />
            <FeatureItem text="Support client prioritaire 24/7" />
            <FeatureItem text="Badge vendeur certifié" />
          </View>

          {/* Bottom CTA Section */}
          <View style={styles.ctaContainer}>
            <View style={styles.trialInfo}>
              <Text style={styles.trialTitle}>🎁 Offre de bienvenue</Text>
              <Text style={styles.trialText}>Profitez de 14 jours de premium gratuit pour votre nouvelle inscription.</Text>
            </View>

            <TouchableOpacity style={styles.mainButton} onPress={handleSubscribe}>
              <Text style={styles.mainButtonText}>
                {selectedPlan === 'yearly' ? 'COMMENCER (14 Jours Gratuits)' : 'S\'ABONNER MAINTENANT'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>Non merci, je préfère rester limité</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  // Header Styles
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  badge: {
    backgroundColor: COLORS.goldDim,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  badgeText: {
    color: COLORS.gold,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  goldText: {
    color: COLORS.gold,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  // Pricing Styles
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: COLORS.cardBg,
    width: '48%',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  selectedCard: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldDim,
  },
  planTitle: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '600',
  },
  price: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 12,
    fontWeight: 'normal',
    color: COLORS.gray,
  },
  saveBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  saveText: {
    color: COLORS.darkBg,
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Feature Styles
  featuresContainer: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 5,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  checkIcon: {
    color: COLORS.darkBg,
    fontWeight: 'bold',
    fontSize: 14,
  },
  featureText: {
    color: COLORS.white,
    fontSize: 15,
    flex: 1,
  },
  // CTA Styles
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  trialInfo: {
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  trialTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  trialText: {
    color: COLORS.gray,
    textAlign: 'center',
    fontSize: 13,
  },
  mainButton: {
    backgroundColor: COLORS.gold,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 15,
  },
  mainButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: COLORS.gray,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
