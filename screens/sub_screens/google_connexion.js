import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Button } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '670788533243-e6usit7hqqtsac2fp0evenoj7ev9k72d.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('Access token:', authentication.accessToken);
     
    }
  }, [response]);

  return (
    <Button
      disabled={!request}
      title="Se connecter avec Google"
      onPress={() => promptAsync()}
    />
  );
}
