import React, {useState, useEffect} from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, Platform, Alert} from 'react-native';
import * as FileSystem from 'expo-file-system';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//import { response } from 'express';
import * as fileManager from '../util/file-manager';
//import { SHA256 } from 'react-native-sha';
import * as Crypto from 'expo-crypto';
//import NetInfo from "@react-native-community/netinfo";
import * as Device from 'expo-device';
import * as debbug_lib from '../util/debbug.js';
//import id from 'dayjs/locale/id';
//Limport { has } from 'lodash-es';
import axios from 'axios';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};

//POUR TOUT LES LOGIN ET ID penser à utiliser un hash SHA-256
//il faudra mettre une confirmation par email pour les nouveaux utilisateurs
//on doit aussi checker que le mail/tel n'existe pas déjà dans la base de données

const enregistrer = ({route, navigation }) => {
  const { data } = route.params;
  const [nom, setNom] = useState('');
  const [Prenom, setPrenom] = useState('');
  const [Email, setEmail] = useState('');
  const [Tel, setTel] = useState('');
  const [Password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const id_choosen = Math.floor(Math.random() * 1000000);
  
  //const sha256 = new SHA256();
  

  return (
     <View style={styles.container}>
        
     </View>
  );
};


export default enregistrer;