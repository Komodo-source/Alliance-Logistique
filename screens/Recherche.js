import React from 'react';
import { View, Text, Button } from 'react-native';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};


const Recherche = ({ navigation }) => {
  return (
    <View>
      <Text>Details Screen</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
        <View>
          
        </View>
    </View>
  );
};

export default Recherche;