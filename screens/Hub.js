import React from 'react';
import { View, Text, Button } from 'react-native';


const express = require("express")
const mysql = require("mysql2")
const cors = require("cors")

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'ton_user',
  password: 'ton_password',
  database: 'ta_base_de_donnees'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connecté à MySQL');
});

const Hub = ({ navigation }) => {
  return (
    <View>
      <Text>Details Screen</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default Hub;