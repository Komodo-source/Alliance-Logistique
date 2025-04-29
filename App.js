import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Loading from './screens/loading';
import Accueil from './screens/Accueil';
import Hub from './screens/Hub';
import Recherche from './screens/Recherche';
import Profil from './screens/Profil';
import Formulaire from './screens/Formulaire';
import Details from './screens/sub_screens/Details';
import HomePage from './screens/sub_screens/Home-Page';
import choixType from './screens/sub_screens/choixType';
import Login from './screens/sub_screens/login';
import enregistrer from './screens/sub_screens/enregistrer';
import Produit from './screens/Produit';
import DetailProduit from './screens/sub_screens/DetailProduit';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading">
      <Stack.Screen name="Loading" component={Loading} options={{ headerShown: false }} />
        <Stack.Screen name="Accueil" component={Accueil} options={{ headerShown: false }} />
        <Stack.Screen name="Hub" component={Hub} options={{ headerShown: false }} />
        <Stack.Screen name="Recherche" component={Recherche} options={{ headerShown: false }} />
        <Stack.Screen name="Profil" component={Profil} options={{ headerShown: false }} />
        <Stack.Screen name="Formulaire" component={Formulaire} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }}/>
        <Stack.Screen name="choixType" component={choixType} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="enregistrer" component={enregistrer} />
        <Stack.Screen name="Produit" component={Produit} options={{ headerShown: false }} />
        <Stack.Screen name="DetailProduit" component={DetailProduit} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;