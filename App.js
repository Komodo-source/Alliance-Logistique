import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//import 'react-native-reanimated';
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
import detail_Commande from './screens/sub_screens/detail_Commande';
import commande_reccurente from './screens/sub_screens/commande_recurrentes';
import detail_commande_reccurente from './screens/sub_screens/detail_commande_reccurente';
import first_page from './screens/first/first_page';
import fournisseur_produit from './screens/sub_screens/fournisseur_produit';
import payement from './screens/sub_screens/payement'
import ParentAlert from './screens/util/ParentAlert';
import Notification from './NotificationService';

const Stack = createNativeStackNavigator();

const App = () => {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ParentAlert />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Loading">
          <Stack.Screen name="Loading" component={Loading} options={{ headerShown: false }} />
          <Stack.Screen name="Accueil" component={Accueil} options={{ headerShown: false }} />
          <Stack.Screen name="Hub" component={Hub} options={{ headerShown: false }} />
          <Stack.Screen name="Recherche" component={Recherche} options={{ headerShown: false }} />
          <Stack.Screen name="Profil" component={Profil} options={{ headerShown: false }} />
          <Stack.Screen name="Formulaire" component={Formulaire} options={{headerTitle : "Formulaire" }}/>
          <Stack.Screen name="Details" component={Details} />
          <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }}/>
          <Stack.Screen name="choixType" component={choixType} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="enregistrer" component={enregistrer} />
          <Stack.Screen name="Produit" component={Produit} options={{ headerShown: false }} />
          <Stack.Screen name="DetailProduit" component={DetailProduit} options={{headerTitle : "Produit" }}/>
          <Stack.Screen name="detail_Commande" component={detail_Commande} options={{headerTitle : "Commande" }}/>          
          <Stack.Screen name="commande_reccurente" component={commande_reccurente} options={{ headerShown: false }}/>
          <Stack.Screen name="detail_commande_reccurente" component={detail_commande_reccurente} options={{ headerShown: false }}/>
          <Stack.Screen name="first_page" component={first_page} options={{ headerShown: false }}/>
          <Stack.Screen name="fournisseur_produit" component={fournisseur_produit} options={{ headerShown: false }}/>
          <Stack.Screen name="payement" component={payement} options={{ headerTitle : "Payement" }}/>
          <Stack.Screen name="Notification" component={Notification} options={{ headerTitle : "Notification" }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;