import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image} from 'react-native';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};

//dans la composition il s'agit d"un exemple
const Details = ({ route, navigation }) => {
  const { data } = route.params;
  return (
    <View style={styles.body}>
      <Text style={styles.titleCmd}>{data.nom_dmd}</Text>
      <Text style={styles.descCmd}>{data.desc_dmd}</Text>
      <Text style={styles.dateCmd}>Doit imprérativement être livré au: {data.date_fin}</Text>      


      <Text style={styles.titleComposition}>Composition de la commande: </Text>
      <View style={styles.composition}> 
        <TouchableOpacity style={styles.produit}>
          <Text style={styles.produitLibelle}>3 x Tomate</Text>
          <Image
          style={styles.logoProduit}
          source={require('../../assets/Icons/Dark-tomato.png')}
        />
        </TouchableOpacity>
        <View style={styles.divisor}></View>
        <TouchableOpacity style={styles.produit}>
          <Text style={styles.produitLibelle}>3 x Tomate</Text>
          <Image
          style={styles.logoProduit}
          source={require('../../assets/Icons/Dark-tomato.png')}
        />
        </TouchableOpacity>

      </View>

      
      <TouchableOpacity
      style={styles.reponseCommande}
      >
        <Text style={styles.textButton}>Je peux répondre à cette commande</Text>
        <Image
          style={styles.logoNavBar}
          source={require('../../assets/Icons/Dark-continue.png')}
        />
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  body: {
    marginLeft : 20,
    marginTop: 20
  }, 
  titleCmd : {
    fontSize: 25,
    fontWeight: "bold",

  },
  descCmd : {
    fontSize : 16,
    fontWeight: 10,
    marginLeft : 30,
    marginTop: 20,
    marginRight : 15
  },

  dateCmd : {
    marginTop: 20,
    color: "#181818",
    fontWeight: "600"
  },
  //boutton
  reponseCommande : {
    backgroundColor : "#45b308",
    display: "flex",
    flexDirection : "row",
    padding : 15,
    borderRadius : 15,
    marginRight : 15 // Important a appliqué    
  },
  textButton : {
    color : "#FFFFFF",
    fontSize : 18,
    fontWeight: "600",
    marginTop: 5,
    position: "static",

  },
  titleComposition : {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20
  },
  //composition des produits
  composition: {
    backgroundColor: "#7CC6FE",
    borderRadius: 15,
    marginRight : 15,
    padding: 15,
    marginBottom : 30
  },
  produitLibelle : {
    fontWeight : "700",
    fontSize : 16
  },
  divisor : {
    borderRadius : 25,
    backgroundColor : "#111",
    height: 3,
    width : 250,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  produit : {
    display : "flex",
    flexDirection: "row",
    marginLeft: 10
  },
  logoProduit : {
    height: 25,
    width: 25,
    marginLeft: 5
  }
  
});

export default Details;