import React from 'react';
import { View, Text, Button } from 'react-native';

var headers = {
  'Accept' : 'application/json',
  'Content-Type' : 'application/json'
};


const Profile = ({ navigation }) => {

  const fetch_user_data  = async () => {
    try {
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/get_user_info.php');
      const data = await response.json();
      console.log("data user: ", data);

    } catch (error) {
      console.error(error);
    }
  };


  return (
    <View>
      <Text>Name</Text>
    </View>
  );
};

export default Profile;