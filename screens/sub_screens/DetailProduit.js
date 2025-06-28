import React from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity} from 'react-native';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};

export const loadImages = (id_produit) => {
  switch(id_produit){
      case "1":
          return require('../../assets/img_product/3.jpg');
      case "2":
          return require('../../assets/img_product/2.jpg');
      case "3":
          return require('../../assets/img_product/3.jpg');
      case "4":
          return require('../../assets/img_product/4.jpg');        
      case "8":
          return require('../../assets/img_product/8.jpg');
      case "10":
          return require('../../assets/img_product/10.jpg');
      case "11":
          return require('../../assets/img_product/11.jpg');
      case "12":
          return require('../../assets/img_product/12.jpg');
      default:
          return require('../../assets/img_product/default.png');
  }
}

const DetailProduit = ({ route, navigation }) => {
    const { item } = route.params;
    console.log(item );
  return (
    <View style={styles.container}>
      <View style={styles.main}>
            <View >
                <Text style={styles.title}>{item.nom_produit}</Text>            
                <Text style={styles.categorie}>Catégorie: {item.nom_categorie}</Text>    
            </View>
            <Image source={loadImages(item.id_produit)} style={styles.image} />
        </View>
        

        <Text style={styles.description}>Ceci est une description du produit le temps que l'on introduise la description du produit</Text>
        <Text style={styles.price}>Prix facturée: {item.prix_produit} FCFA</Text>
        <TouchableOpacity
        style={styles.LoginButton}
        onPress={() => navigation.navigate('Formulaire')}
      >
        <Text style={{color: "#fff", fontSize: 19, fontWeight: "500"}}>
          Passer commande
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.Panier}
        onPress={() => navigation.navigate('commande_reccurente')}
      >
        <Text style={{color: "#fff", fontSize: 19, fontWeight: "500"}}>
          Ajouter à une commande récurrente
        </Text>

      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    main : {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    image : {
        width: 180,
        height: 180,
        borderRadius: 8,
        marginBottom: 8,
        marginRight: 35,
        marginTop: 35,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title : {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 45,
        marginLeft: 25,
        width: '80%',
    },

    price : {
        fontSize: 16,
        marginBottom: 10,
        marginTop: 20,
        fontWeight : '600',
        color : '#2E7D32',
        marginLeft: 25,
    },
    description : {
        fontSize: 16,
        marginLeft: 25,
        marginRight: 25,
        marginTop: 20,
        fontWeight: '450',
    },
    categorie : {
        fontSize: 16,
        marginLeft: 25,
        marginRight: 25,
        marginTop: 15,
        fontWeight: '600',
    },
    LoginButton : {
        height: 40,
        borderRadius: 7,
        width: '80%',
        backgroundColor: '#2E7D32',
        alignSelf: 'center',
        marginTop: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },

      Panier : {
        height: 40,
        borderRadius: 7,
        width: '80%',
        backgroundColor: '#0141d2',
        alignSelf: 'center',
        marginTop: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
})

export default DetailProduit;