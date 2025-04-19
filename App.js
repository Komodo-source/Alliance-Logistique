import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Accueil from './screens/Accueil';
import Hub from './screens/Hub';
import Recherche from './screens/Recherche';
import Profil from './screens/Profil';
import Formulaire from './screens/Formulaire';
import Details from './screens/sub_screens/Details';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Accueil">
        <Stack.Screen name="Accueil" component={Accueil} />
        <Stack.Screen name="Hub" component={Hub} />
        <Stack.Screen name="Recherche" component={Recherche} />
        <Stack.Screen name="Profil" component={Profil} />
        <Stack.Screen name="Formulaire" component={Formulaire} />
        <Stack.Screen name="Details" component={Details} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;