import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button,Image} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';



const Accueil = ({ navigation }) => {
  return (
    <View style={styles.container}>

      <View style={styles.navbar}> 
        <TouchableOpacity 
          style={styles.navButton}
          //onPress={() => console.log('Recherche pressé')}
          onPress={() => navigation.navigate('Recherche')}
        >
          <Text style={styles.navButtonText}>Recherche</Text>
        </TouchableOpacity>


        <TouchableOpacity 
          style={[styles.navButton, styles.activeButton]}
          //onPress={() => console.log('Accueil pressé')}
          onPress={() => navigation.navigate('Accueil')}
        >
          <Text style={styles.navButtonText}>Accueil</Text>
            <Image
              style={styles.logoNavBar}
              source={require('../assets/Icons/Dark-House.png')}
            />
        </TouchableOpacity>
        
         
        <TouchableOpacity 
          style={styles.navButton}
          //onPress={() => console.log('Hub pressé')}
          onPress={() => navigation.navigate('Hub')}
        >
          <Text style={styles.navButtonText}>Hub</Text>
          <Image
              style={styles.logoNavBar}
              source={require('../assets/Icons/Dark-Hub.png')}
            />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          //onPress={() => console.log('Profil pressé')}
          onPress={() => navigation.navigate('Profil')}
        >
          <Text style={styles.navButtonText}>Profil</Text>
          <Image
              style={styles.logoNavBar}
              source={require('../assets/Icons/Dark-profile.png')}
            />
        </TouchableOpacity>
      </View>
      <View>
      <TouchableOpacity 

          style={styles.navButton}
          //onPress={() => console.log('Hub pressé')}
          onPress={() => navigation.navigate('Formulaire')} >
              <Text>hdfs</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoNavBar: {
    width: 30,
    height: 30,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F9F6EE',
    backgroundColor: '#F9F6EE',
  },
  navButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'column',
    alignItems: 'center'
  },
  activeButton: {
    borderRadius: 40,
    backgroundColor: '#7CC6FE',
    width: 120
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: "bold"
  },

});

export default Accueil;