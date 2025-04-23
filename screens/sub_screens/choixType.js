import React from 'react';
import { View, Text, Button,TouchableOpacity, Image, StyleSheet} from 'react-native';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};


const choixType = ({ navigation }) => {
  return (
    <View>
      <Text style={{fontSize : 21, color : "#000", fontWeight : "600", marginTop: 25, marginLeft : 25}}>Je suis: </Text>

        <TouchableOpacity
        style={styles.CoursierBoutton}  
        onPress={() => navigation.navigate('enregistrer', {data: "co"})}      
        >
            <Image
              style={{}}
              source={require('../../assets/Icons/White-Signup.png')}
            />  
            <Text style={{fontSize : 16, color : "#000", textAlign : "center", fontWeight : "600"}}>Coursier</Text>  
        </TouchableOpacity>


        <TouchableOpacity
        style={styles.CoursierBoutton} 
        onPress={() => navigation.navigate('enregistrer', {data: "fo"})}        
        >
            <Image
              style={{}}
              source={require('../../assets/Icons/White-Signup.png')}
            />  
            <Text style={{fontSize : 16, color : "#000", textAlign : "center", fontWeight : "600"}}>Fournisseur</Text>  
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.CoursierBoutton}        
        onPress={() => navigation.navigate('enregistrer', {data: "cl"})}
        >
            <Image
              style={{}}
              source={require('../../assets/Icons/White-Signup.png')}
            />  
            <Text style={{fontSize : 16, color : "#000", textAlign : "center", fontWeight : "600"}}>Client</Text>  
        </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
    CoursierBoutton : {
        marginTop: 35,
        backgroundColor : "#B8E0FF",
        borderRadius : 35,
        marginLeft : 15,
        marginRight : 15,
        display : "flex",
        flexDirection : "row",
        height : 60,
        alignItems : "center",
        justifyContent : "center"
      },
});

export default choixType;