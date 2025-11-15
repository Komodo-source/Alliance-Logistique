import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { debbug_log } from '../util/debbug';

const UPLOAD_URL = 'https://nbgfetlejuskutvxvfmd.supabase.co/functions/v1/upload';
const DELETE_URL = 'https://nbgfetlejuskutvxvfmd.supabase.co/functions/v1/delete-photo';
const LIST_URL = 'https://nbgfetlejuskutvxvfmd.supabase.co/functions/v1/list-photos';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iZ2ZldGxlanVza3V0dnh2Zm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTI3NTMsImV4cCI6MjA3ODUyODc1M30.pIj8KNWVxzBnhatG4HvqpXB36D4dPO4T8R7E-aShuEI';

//Enfaite ce script ne peux pas marcher sur émulateur
//ar il y aun truc qui bloque le TLS
// donc ca cause un problème
//donc je viens de predre 1h30 de ma vie a essayé de fix un
//truc infixable :/


export default function UploadPhoto({ navigation }) {
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const response = await fetch(`${LIST_URL}?target_type=client&target_id=1`, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
        debbug_log(`Loaded ${data.photos?.length || 0} photos`, "green");
      }
    } catch (err) {
      debbug_log(`Error loading photos: ${err.message}`, "red");
    } finally {
      setLoadingPhotos(false);
    }
  };

  const uploadPhoto = async (asset) => {
    debbug_log("uploading photo", "cyan");
    setBusy(true);
    setError(null);

    try {
      const metadata = {
        caption: 'Uploaded from RN',
        tags: ['mobile', 'react-native'],
      };

      const target_type = 'client';
      const target_id = '1';

      const formData = new FormData();

      formData.append('file', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `photo_${Date.now()}.jpg`,
      });

      formData.append('target_type', target_type);
      formData.append('target_id', target_id);
      formData.append('metadata', JSON.stringify(metadata));

      const headers = {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      };

      debbug_log(`Uploading to: ${UPLOAD_URL}`, "cyan");

      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers,
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        debbug_log(`Error occurred: ${json?.error}`, "red");
        setError(json?.error || JSON.stringify(json));
        Alert.alert('Upload Failed', json?.error || 'Unknown error');
      } else {
        debbug_log("Upload successful!", "green");
        Alert.alert('Success', 'Photo uploaded successfully!');
        await loadPhotos(); // Reload photos list
      }
    } catch (err) {
      console.error('Upload error:', err);
      debbug_log(`Upload error: ${err.message}`, "red");
      setError(String(err.message || err));
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setBusy(false);
    }
  };

  const deletePhoto = async (photoId) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setBusy(true);
              const response = await fetch(`${DELETE_URL}/${photoId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
              });

              if (response.ok) {
                debbug_log(`Photo ${photoId} deleted`, "green");
                Alert.alert('Success', 'Photo deleted successfully!');
                setSelectedPhoto(null);
                await loadPhotos();
              } else {
                const json = await response.json();
                Alert.alert('Error', json?.error || 'Failed to delete photo');
              }
            } catch (err) {
              debbug_log(`Delete error: ${err.message}`, "red");
              Alert.alert('Error', 'Failed to delete photo');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      debbug_log("📷 Requesting camera permissions...", "cyan");
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        debbug_log("❌ Camera permission denied", "red");
        Alert.alert('Permission needed', 'Camera permission is required');
        return;
      }

      debbug_log("📸 Launching camera...", "cyan");
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        debbug_log(`Photo captured: ${result.assets[0].uri}`, "green");
        await uploadPhoto(result.assets[0]);
      }
    } catch (err) {
      console.error('Camera error:', err);
      debbug_log(`💥 Camera error: ${err.message}`, "red");
      Alert.alert('Error', 'Failed to launch camera');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Photo library permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (err) {
      console.error('Gallery error:', err);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const renderPhotoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.photoCard}
      onPress={() => setSelectedPhoto(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.signed_url }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.photoInfo}>
        <Text style={styles.photoFilename} numberOfLines={1}>
          {item.filename}
        </Text>
        <Text style={styles.photoDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cameraButton]}
          onPress={handleTakePhoto}
          disabled={busy}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonIcon}>📷</Text>
          <Text style={styles.actionButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.galleryButton]}
          onPress={handlePickFromGallery}
          disabled={busy}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonIcon}>🖼️</Text>
          <Text style={styles.actionButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Photos Grid */}
      <View style={styles.photosSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Photos</Text>
          <TouchableOpacity onPress={loadPhotos} disabled={loadingPhotos}>
            <Text style={styles.refreshButton}>🔄</Text>
          </TouchableOpacity>
        </View>

        {loadingPhotos ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : photos.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>📸</Text>
            <Text style={styles.emptySubtext}>No photos yet</Text>
            <Text style={styles.emptyHint}>Take a photo to get started</Text>
          </View>
        ) : (
          <FlatList
            data={photos}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Upload Progress */}
      {busy && (
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadCard}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.uploadText}>Processing...</Text>
          </View>
        </View>
      )}

      {/* Photo Detail Modal */}
      <Modal
        visible={selectedPhoto !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPhoto(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {selectedPhoto && (
              <>
                <Image
                  source={{ uri: selectedPhoto.signed_url }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
                <View style={styles.modalInfo}>
                  <Text style={styles.modalFilename}>{selectedPhoto.filename}</Text>
                  <Text style={styles.modalDate}>
                    {new Date(selectedPhoto.created_at).toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deletePhoto(selectedPhoto.id)}
                    disabled={busy}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Delete Photo</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cameraButton: {
    backgroundColor: '#007AFF',
  },
  galleryButton: {
    backgroundColor: '#34C759',
  },
  actionButtonIcon: {
    fontSize: 24,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  photosSection: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  refreshButton: {
    fontSize: 24,
  },
  gridContent: {
    paddingBottom: 16,
  },
  photoCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E5E5EA',
  },
  photoInfo: {
    padding: 8,
  },
  photoFilename: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  photoDate: {
    fontSize: 11,
    color: '#8E8E93',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: '#8E8E93',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  fullImage: {
    flex: 1,
    width: '100%',
  },
  modalInfo: {
    backgroundColor: '#fff',
    padding: 20,
    gap: 8,
  },
  modalFilename: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
