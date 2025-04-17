import React from 'react';
import { View, Text, Button } from 'react-native';


const Hub = ({ navigation }) => {
  return (
    <View>
      <Text>Details Screen</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
        
    </View>
  );
};

export default Hub;