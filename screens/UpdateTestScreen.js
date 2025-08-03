import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Updates from 'expo-updates';
import * as fileManager from './util/file-manager.js';
import * as debbug_lib from './util/debbug.js';

// Ce fichier est obsolète et sera supprimé dans la prochaine version majeure.

const UpdateTestScreen = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runDiagnostic = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('=== UPDATE SYSTEM DIAGNOSTIC STARTED ===', 'header');
      
      // 1. Basic Updates module check
      addResult(`Updates module available: ${!!Updates}`, 'info');
      
      // 2. Check if updates are enabled
      addResult(`Updates enabled: ${Updates.isEnabled}`, Updates.isEnabled ? 'success' : 'warning');
      
      // 3. Current update info
      addResult(`Channel: ${Updates.channel || 'N/A'}`, 'info');
      addResult(`Update ID: ${Updates.updateId || 'N/A'}`, 'info');
      addResult(`Runtime Version: ${Updates.runtimeVersion || 'N/A'}`, 'info');
      
      // 4. Check for updates
      addResult('Checking for updates...', 'info');
      const update = await Updates.checkForUpdateAsync();
      addResult(`Update available: ${update.isAvailable}`, update.isAvailable ? 'success' : 'info');
      
      if (update.manifest) {
        addResult(`Update manifest found: ${JSON.stringify(update.manifest, null, 2)}`, 'info');
      }
      
      // 5. Local storage version check
      try {
        const dataUser = await fileManager.read_file("auto.json");
        addResult(`Stored version: ${dataUser?.version || 'N/A'}`, 'info');
      } catch (error) {
        addResult(`Error reading local storage: ${error.message}`, 'error');
      }
      
      // 6. Test update URL
      try {
        const updateUrl = 'https://u.expo.dev/e2aaec2e-feae-4114-b202-d73b6e6474ae';
        const response = await fetch(updateUrl);
        addResult(`Update URL accessible: ${response.ok} (${response.status})`, response.ok ? 'success' : 'error');
      } catch (error) {
        addResult(`Update URL error: ${error.message}`, 'error');
      }
      
      addResult('=== DIAGNOSTIC COMPLETE ===', 'header');
      
    } catch (error) {
      addResult(`Diagnostic error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testUpdate = async () => {
    setIsLoading(true);
    
    try {
      addResult('=== TESTING UPDATE PROCESS ===', 'header');
      
      if (!Updates.isEnabled) {
        addResult('Updates not enabled - cannot test', 'warning');
        return;
      }
      
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        addResult('Update available! Starting update process...', 'success');
        
        try {
          await Updates.fetchUpdateAsync();
          addResult('Update fetched successfully', 'success');
          addResult('Reloading app...', 'info');
          await Updates.reloadAsync();
        } catch (fetchError) {
          addResult(`Error during update: ${fetchError.message}`, 'error');
        }
      } else {
        addResult('No update available to test', 'info');
      }
      
    } catch (error) {
      addResult(`Update test error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'header': return '#2196F3';
      default: return '#333';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update System Test</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Run Diagnostic" 
          onPress={runDiagnostic}
          disabled={isLoading}
        />
        <Button 
          title="Test Update" 
          onPress={testUpdate}
          disabled={isLoading}
        />
        <Button 
          title="Clear Results" 
          onPress={clearResults}
          disabled={isLoading}
        />
      </View>
      
      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <Text key={index} style={[styles.resultText, { color: getResultColor(result.type) }]}>
            [{result.timestamp}] {result.message}
          </Text>
        ))}
        {isLoading && <Text style={styles.loadingText}>Loading...</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});

export default UpdateTestScreen; 