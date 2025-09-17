import { Linking, Alert, Platform } from 'react-native';

export const openNavigationWithChoice = async (latitude, longitude, label = 'Destination') => {
  const urls = {
    googleMaps: Platform.select({
      ios: `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`,
      android: `google.navigation:q=${latitude},${longitude}`
    }),
    waze: `waze://?ll=${latitude},${longitude}&navigate=yes`,
    appleMaps: `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`,
    mappy: `mappy://?lat=${latitude}&lon=${longitude}&navigate=1`,
    geo: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(label)})`
  };

  // Check which apps are available
  const availableApps = [];

  for (const [appName, url] of Object.entries(urls)) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        availableApps.push({ name: appName, url });
      }
    } catch (error) {
      console.warn(`Could not check ${appName}:`, error);
    }
  }

  if (availableApps.length === 0) {
    Alert.alert('Erreur', 'Pas d\'application de navigation disponible');
    return;
  }

  // Show action sheet with available apps
  Alert.alert(
    'Choisir une app de navigation',
    'Sélectionner votre app de navigation:',
    availableApps.map((app, index) => ({
      text: app.name.replace(/([A-Z])/g, ' $1').trim(),
      onPress: () => Linking.openURL(app.url),
      style: index === 0 ? 'default' : 'default'
    })),

  );
};
