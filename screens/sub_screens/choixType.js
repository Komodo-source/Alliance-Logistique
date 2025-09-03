import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';

const choixType = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Je suis:</Text>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => navigation.navigate('enregistrer', { data: 'fo' })}
        >
          <Image
            style={styles.icon}
            source={require('../../assets/Icons/White-Signup.png')}
          />
          <Text style={styles.roleText}>Fournisseur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => navigation.navigate('enregistrer', { data: 'cl' })}
        >
          <Image
            style={styles.icon}
            source={require('../../assets/Icons/White-Signup.png')}
          />
          <Text style={styles.roleText}>Client</Text>
        </TouchableOpacity>

        {/* You can uncomment and use this if needed */}
        
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => navigation.navigate('enregistrer', { data: 'co' })}
        >
          <Image
            style={styles.icon}
            source={require('../../assets/Icons/White-Signup.png')}
          />
          <Text style={styles.roleText}>Coursier</Text>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9FC',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 30,
    marginLeft: 5,
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 20,
  },
  roleButton: {
    flexDirection: 'row',
    backgroundColor: '#B8E0FF',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 15,
    resizeMode: 'contain',
  },
  roleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E1E',
  },
});

export default choixType;
