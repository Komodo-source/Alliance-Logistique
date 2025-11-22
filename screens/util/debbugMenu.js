import React, { useState, useEffect } from 'react';
import { View, Button, Text, ActivityIndicator, Image, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as FileManager from './file-manager';
import { generateLocalNotification } from '../../NotificationService';

export default function DebbugMenu({ navigation }) {
  const [autoData, setAutoData] = useState(null);
  const [recData, setRecData] = useState(null);
  const [testServeurPHP, setTest1] = useState('');
  const [testServeurSupaBase, setTest2] = useState('');
  const [navigationPage, setNavigationPage] = useState('');
  const [NotificationTitle, setNotificationTitle] = useState('');
  const [NotificationBody, setNotificationBody] = useState('');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  const getServeurData = async () => {
    try {
      const response = await fetch('https://backend-logistique-api-latest.onrender.com/db.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      setTest1(JSON.stringify(data, null, 2));
    } catch (error) {
      setTest1(error.toString());
    }
  }

  const getServeurData2 = async () => {
    try {
      const response = await fetch('https://nbgfetlejuskutvxvfmd.supabase.co', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      setTest2(JSON.stringify(data, null, 2));
    } catch (error) {
      setTest2(error.toString());
    }
  }

  const dataFileManager = async () => {
    try {
      const data = await FileManager.read_file("auto.json");
      setAutoData(data);
    } catch (error) {
      setAutoData({ error: error.toString() });
    }
  }

  const dataReccurente = async () => {
    try {
      const data = await FileManager.read_file("reccurente.json");
      setRecData(data);
    } catch (error) {
      setRecData({ error: error.toString() });
    }
  }

  const changeData = async(key, value) => {
    try{
      await FileManager.modify_value_local_storage(key, value, "auto.json");
      alert.alert("valeu modified", "Modified Sucessfully");
    }catch(error){
      alert.alert("value not modified", `Error "${error}" `);
    }
  }

  const handleNavigate = () => {
    if (navigationPage.trim()) {
      try {
        navigation.navigate(navigationPage.trim());
      } catch (error) {
        alert(`Erreur: Page "${navigationPage}" introuvable`);
      }
    }
  }

  useEffect(() => {
    getServeurData();
    getServeurData2();
    dataFileManager();
    dataReccurente();
  }, []); // Empty dependency array to run only once

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Navigation</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom de la page (ex: Accueil)"
          value={navigationPage}
          onChangeText={setNavigationPage}
        />
        <TouchableOpacity style={styles.button} onPress={handleNavigate}>
          <Text style={styles.buttonText}>Naviguer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>change value auto.json</Text>
        <TextInput
          style={styles.input}
          placeholder="key json"
          value={key}
          onChangeText={setKey}
        />
        <TextInput
          style={styles.input}
          placeholder="new value"
          value={value}
          onChangeText={setValue}
        />
        <TouchableOpacity style={styles.button} onPress={() => changeData(key, value)}>
          <Text style={styles.buttonText}>Change</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Générer une notification</Text>
        <TextInput
          style={styles.input}
          placeholder="Titre"
          value={NotificationTitle}
          onChangeText={setNotificationTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Body"
          multiline
          value={NotificationBody}
          onChangeText={setNotificationBody}
        />
        <TouchableOpacity
        style={styles.button}
        onPress={() => generateLocalNotification(NotificationTitle, NotificationBody)}>
          <Text style={styles.buttonText}>Créer une notification</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Auto.json</Text>
        <Text style={styles.jsonText}>
          {autoData ? JSON.stringify(autoData, null, 2) : 'vide'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Reccurente.json</Text>
        <Text style={styles.jsonText}>
          {recData ? JSON.stringify(recData, null, 2) : 'vide'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Test Serveurs</Text>

        <Text style={styles.subtitle}>PHP Server:</Text>
        <Text style={styles.jsonText}>
          {testServeurPHP || 'Chargement...'}
        </Text>

        <Text style={styles.subtitle}>SupaBase Server:</Text>
        <Text style={styles.jsonText}>
          {testServeurSupaBase || 'Chargement...'}
        </Text>
      </View>

      <Text style={styles.version}>Version Admin 1.3.0 Not to distribute</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#555',
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#2c3e50',
    backgroundColor: '#ecf0f1',
    padding: 8,
    borderRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
