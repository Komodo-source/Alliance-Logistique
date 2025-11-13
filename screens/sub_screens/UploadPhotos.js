import React, { useState } from 'react';
import { View, Button, Text, ActivityIndicator, Image, StyleSheet, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const UPLOAD_URL = 'https://nbgfetlejuskutvxvfmd.supabase.co/functions/v1/upload-photo';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iZ2ZldGxlanVza3V0dnh2Zm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTI3NTMsImV4cCI6MjA3ODUyODc1M30.pIj8KNWVxzBnhatG4HvqpXB36D4dPO4T8R7E-aShuEI';

export default function UploadPhoto({ navigation }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const imagePickerOptions = {
    mediaType: 'photo',
    includeBase64: false,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
  };

  const uploadPhoto = async (asset) => {
    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const file = {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
      };

      const metadata = {
        caption: 'Uploaded from RN',
        tags: ['mobile', 'react-native'],
      };

      const target_type = 'client';
      const target_id = '00000000-0000-0000-0000-000000000000';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_type', target_type);
      formData.append('target_id', target_id);
      formData.append('metadata', JSON.stringify(metadata));

      const headers = {
        Accept: 'application/json',
      };

      if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
      }

      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers,
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json?.error || JSON.stringify(json));
      } else {
        setResult(json.photo || json);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const res = await launchCamera(imagePickerOptions);

      if (res.didCancel) {
        return;
      }

      if (res.errorCode) {
        Alert.alert('Camera Error', res.errorMessage || 'Could not access camera');
        return;
      }

      if (res.assets && res.assets.length > 0) {
        await uploadPhoto(res.assets[0]);
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const res = await launchImageLibrary(imagePickerOptions);

      if (res.didCancel) {
        return;
      }

      if (res.errorCode) {
        Alert.alert('Gallery Error', res.errorMessage || 'Could not access gallery');
        return;
      }

      if (res.assets && res.assets.length > 0) {
        await uploadPhoto(res.assets[0]);
      }
    } catch (err) {
      console.error('Gallery error:', err);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="📷 Take Photo"
          onPress={handleTakePhoto}
          disabled={busy}
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="🖼️ Choose from Gallery"
          onPress={handlePickFromGallery}
          disabled={busy}
        />
      </View>

      {busy && <ActivityIndicator style={styles.loader} size="large" />}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>✅ Upload Successful</Text>
          <Text style={styles.resultText}>ID: {result.id}</Text>
          <Text style={styles.resultText}>Filename: {result.filename}</Text>
          <Text style={styles.resultText}>Path: {result.storage_path}</Text>
          <Text style={styles.resultText}>Created: {result.created_at}</Text>

          {result.signed_url && (
            <Image
              source={{ uri: result.signed_url }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  buttonSpacer: {
    height: 12,
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fee',
    borderRadius: 8,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#efe',
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#080',
  },
  resultText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  previewImage: {
    width: '100%',
    height: 250,
    marginTop: 12,
    borderRadius: 8,
  },
});
