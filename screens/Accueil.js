import React from 'react';
import { View, Text, StyleSheet, Button} from 'react-native';

const Accueil = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Hub')}
      />
      
      
      <View style={styles.navbar}>
        <Button
          buttonStyle={styles.navButton}
          titleStyle={styles.navButtonText}
          title="Recherche"
        
          onPress={() => console.log('Recherche pressé')}
        />

        <Button
          buttonStyle={[styles.navButton, styles.activeButton]}
          titleStyle={styles.navButtonText}
          title="Accueil"
          onPress={() => console.log('Accueil pressé')}
        />
         
        <Button
          buttonStyle={styles.navButton}
          titleStyle={styles.navButtonText}
          title="Hub"
          onPress={() => console.log('Hub pressé')}
        />

        <Button
          buttonStyle={styles.navButton}
          title="Profil"
          onPress={() => console.log('Profil pressé')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    borderTopColor: '#ddd',
  },

  navButton: {
    paddingHorizontal: 10,
  },

  activeButton: {
    borderRadius: 90,
  },
  navButtonText: {
    fontSize: 12,
    marginLeft: 5,
  },
});

export default Accueil;