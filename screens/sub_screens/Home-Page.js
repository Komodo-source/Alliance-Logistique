import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image} from 'react-native';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};


const HomePage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.image}>
        <View style={styles.ImgLeft}>
            <Image
              style={styles.logoProduit}
              source={require('../../assets/homepageIMG2.jpg')}
            />
          </View>
          <View style={styles.ImgCenter}>
            <Image
              style={styles.logoProduit}
              source={require('../../assets/homepageIMG.png')}
            />
          </View>
          <View style={styles.ImgRight}>
            <Image
              style={styles.logoProduit}
              source={require('../../assets/homepageIMG2.jpg')}
            />
          </View>

      </View>

      <View style={styles.TitleContainer}>
        <Text style={styles.titre}>Révolutionnez maintenant la façon de vous faire livrer</Text>
        <Text style={styles.titre}>Optez pour l'innovation logistique</Text>
      </View>

      <View style={styles.Buttons}>
        
        <TouchableOpacity // Signup 
        style={styles.SignUpButton}
        onPress={() => navigation.navigate('choixType')}
        >
           <Image
            style={styles.logoNavBar}
            source={require('../../assets/Icons/White-Signup.png')}
          />
          <Text style={{fontSize : 14, color : "#FFFFFF", textAlign : "center", fontWeight : "600"}}>S'inscrire avec Telephone/Email</Text>         
        </TouchableOpacity>


        <TouchableOpacity //Login 
        style={styles.LoginButton}
        onPress={() => navigation.navigate('Login')}
        >
          <Image
            style={styles.logoNavBar}
            source={require('../../assets/Icons/Dark-Login.png')}
          />
          <Text style={{fontSize : 16, color : "#000", textAlign : "center", fontWeight : "600"}}>Se connecter au compte</Text>

        </TouchableOpacity>


        <TouchableOpacity
        style={styles.LoginGoogle}
        >
          <Image
            style={styles.logoNavBar}
            source={require('../../assets/Icons/Dark-continue.png')}
          />
          <Text style={{fontSize : 16, color : "#000", textAlign : "center", fontWeight : "600"}}>Se connecter avec Google</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
    ImgLeft : {
      position : "absolute",
      bottom: 50,
      right: 330,      
    },

    ImgRight : {
      position : "absolute",
      bottom: 60,
      left: 330,      
    },
     image : {
      display : "flex",
      flexDirection : "row",
      justifyContent: 'space-around',
      
     },
    titre:  {
      fontSize : 22,
      fontWeight : "900",
      textAlign : "center",
      marginLeft: 25,
      marginRight: 25,
      marginTop : 25
    },
    TitleContainer : {
      marginTop : 35
    },

    ImgCenter : {
      marginTop: 105,
      display : "flex",
      alignItems : "center"
    },
    logoProduit : {
      width : 210,
      height : 285,
      
    },
    container : {
      marginTop: 25,
    },
    Buttons : {
      margintop : 55
    },
    SignUpButton : {
      marginTop: 35,
      backgroundColor : "#000",
      borderRadius : 35,
      marginLeft : 15,
      marginRight : 15,
      display : "flex",
      flexDirection : "row",
      height : 60,
      alignItems : "center",
      justifyContent : "center"
    },
    LoginButton : {
      marginTop: 10,
      border : "#000",
      borderWidth : 3,
      borderRadius : 35,
      marginLeft : 15,
      marginRight : 15,
      display : "flex",
      flexDirection : "row",
      height : 60,
      alignItems : "center",
      justifyContent : "center"
    },
    LoginGoogle : {
      marginTop: 10,
      border : "#000",
      borderWidth : 3,
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

export default HomePage;