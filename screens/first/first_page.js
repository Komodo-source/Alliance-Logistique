import React, {useState, useEffect} from 'react';
import {Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, Modal, FlatList, View, Button, TouchableOpacity, ScrollView, Image, Alert, PermissionsAndroid, ActivityIndicator, Dimensions, Animated} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
const { width, height } = Dimensions.get('window');

const first_page = ({ navigation }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(1));

    const slides = [
        {
            image: require("../../assets/photo/market1.jpg"),
            title: "Découvrez l'Excellence",
            subtitle: "Des milliers de producteurs, marchand et fermier  à votre portée",
            description: "Des produits frais et de qualité, livrés rapidement"
        },
        {
            image: require("../../assets/photo/market2.jpg"),
            title: "Livraison Ultrarapide",
            subtitle: "En moyenne 25 minutes chrono",
            description: "Vos produits favoris livrés frais à votre porte"
        },
        {
            image: require("../../assets/photo/market3.jpg"),
            title: "Qualité Garantie",
            subtitle: "Plus de 50,000 utilisateurs satisfaits",
            description: "Rejoignez notre communauté de fins gourmets"
        }
    ];

    useEffect(() => {
        let timer;
        let timeoutId;
        
        timer = setInterval(() => {
            setCurrentSlide(prev => {
                if (prev < slides.length - 1) {
                    return prev + 1;
                } else {
                    timeoutId = setTimeout(() => {
                        console.log("Navigating to HomePage after 50 seconds");
                        navigation.navigate('HomePage');
                    }, 50000);
                    return prev;
                }
            });
        }, 20500);
    
        return () => {
            clearInterval(timer);
            if (timeoutId) {
                clearTimeout(timeoutId); // Nettoyer aussi le setTimeout
            }
        };
    }, [navigation]);

    const goToNextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigation.navigate('HomePage');
        }
    };

    const skipIntro = () => {
        navigation.navigate('HomePage');
    };

    return (
        <View style={styles.container}>
            {/* Header avec bouton Skip */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.skipButton} onPress={skipIntro}>
                    <Text style={styles.skipText}>Passer</Text>
                </TouchableOpacity>
            </View>

            {/* Image principale */}
            <View style={styles.imageContainer}>
                <Image
                    source={slides[currentSlide].image}
                    style={styles.img_principal}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />
            </View>

            {/* Contenu textuel */}
            <View style={styles.contentContainer}>
                <Text style={styles.title}>
                    {slides[currentSlide].title}
                </Text>
                <Text style={styles.subtitle}>
                    {slides[currentSlide].subtitle}
                </Text>
                <Text style={styles.description}>
                    {slides[currentSlide].description}
                </Text>
            </View>

            {/* Indicateurs de progression */}
            <View style={styles.indicatorContainer}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            {
                                backgroundColor: index === currentSlide ? '#FF6B35' : '#E0E0E0',
                                width: index === currentSlide ? 30 : 8,
                            }
                        ]}
                    />
                ))}
            </View>

            {/* Bouton d'action */}
            <View style={styles.actionContainer}>
                {currentSlide < slides.length - 1 ? (
                    <TouchableOpacity style={styles.nextButton} onPress={goToNextSlide}>
                        <Text style={styles.nextButtonText}>Suivant</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('HomePage')}>
                        <Text style={styles.startButtonText}>Commencer</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Logo/Nom de l'app en bas */}
            <View style={styles.footer}>
                <Text style={styles.appName}>Alliance Logistique</Text>
                <Text style={styles.tagline}>Votre service, notre mission</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 100,
    },
    skipButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    skipText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    imageContainer: {
        height: height * 0.5,
        position: 'relative',
    },
    img_principal: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FF6B35',
        textAlign: 'center',
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        gap: 8,
    },
    indicator: {
        height: 8,
        borderRadius: 4,
        transition: 'all 0.3s ease',
    },
    actionContainer: {
        paddingHorizontal: 30,
        marginBottom: 20,
    },
    nextButton: {
        backgroundColor: '#FF6B35',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    startButton: {
        backgroundColor: '#27AE60',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#27AE60',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 5,
    },
    tagline: {
        fontSize: 14,
        color: '#95A5A6',
        fontStyle: 'italic',
    },
});

export default first_page;