import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  Dimensions
} from 'react-native';


const PublicProfile = ({ route, navigation }) => {
    // le paramètre est sous la forme
    //session_id: "x"
    const {id_session} = route.params;

  useEffect(() => {
  }, []);



  return (
    <View>

    </View>
  );
};

const styles = StyleSheet.create({
});

export default PublicProfile;