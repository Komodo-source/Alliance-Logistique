import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createClient } from '@supabase/supabase-js';
import { debbug_log } from '../util/debbug';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { getAlertRef } from "../util/AlertService";
import { read_file } from '../util/file-manager';
import { getUserDataIdFromSession } from '../util/Polyvalent';

// --- Removed 'react-native-fs' import to fix the crash ---

const SUPABASE_URL = 'https://nbgfetlejuskutvxvfmd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iZ2ZldGxlanVza3V0dnh2Zm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTI3NTMsImV4cCI6MjA3ODUyODc1M30.pIj8KNWVxzBnhatG4HvqpXB36D4dPO4T8R7E-aShuEI';
const BUCKET_NAME = 'media';
const MAX_PHOTOS = 4;

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function UploadPhoto({ navigation }) {
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [pendingAssets, setPendingAssets] = useState([]);
  const fadeAnim = new Animated.Value(0);

  // FIX: Changed 'cont' to 'const'
  const [NbPhotoTaken, SetNbPhotoTaken] = useState(0);

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [photos]);

  const loadPhotos = async () => {
    try {
      setLoadingPhotos(true);

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      if (data) {
        const photosWithUrls = data.map((file) => {
            const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(file.name);

            return {
                id: file.id,
                filename: file.name,
                signed_url: urlData.publicUrl,
            };
        });
        setPhotos(photosWithUrls);
        // Optional: Update NbPhotoTaken based on existing photos if needed
        // SetNbPhotoTaken(photosWithUrls.length);
      }
    } catch (err) {
      debbug_log(`Error loading photos: ${err.message}`, 'red');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const queuePhotos = async (assets) => {
    setPendingAssets((prev) => [...prev, ...assets]);
  };

  const uploadQueuedPhotos = async () => {
    if (pendingAssets.length === 0) return;
    setBusy(true);

    const failed = [];
    const assetsToUpload = [...pendingAssets];

    for (const asset of assetsToUpload) {
      try {
        await uploadPhoto(asset);
      } catch (err) {
        debbug_log(`Queue item failed: ${asset.uri}`, 'red');
        failed.push(asset);
      }
    }

    if (failed.length === 0) {
      setPendingAssets([]);
      Alert.alert('Success', 'All images uploaded successfully.');
    } else {
      setPendingAssets(failed);
      Alert.alert(
        'Upload Incomplete',
        `${failed.length} image(s) failed. They are still in the queue.`
      );
    }

    await loadPhotos();
    setBusy(false);
  };

  const uploadPhoto = async (asset) => {
    try {
      const ext = asset.uri.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const storagePath = `media/${fileName}`;

      // Use Expo FileSystem (Correct for Expo)
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileData = decode(base64);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileData, {
          contentType: asset.mimeType || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Database Insert
      const user_data = await read_file("auto.json");
      // Handle potential null read_file result
      if (!user_data) throw new Error("Could not read local user data");

      const id = getUserDataIdFromSession(user_data.session_id);

      if(id === null){
        // FIX: Changed 'alert.alert' to 'Alert.alert'
        Alert.alert("Oups", "Une erreur a eu lieu veuillez reessayer plus tard");
        return; // Stop execution
      }

      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          target_type: 'fournisseur',
          target_id: id,
          filename: fileName,
          storage_path: storagePath,
          content_type: asset.mimeType || 'image/jpeg',
          size: fileData.byteLength,
          metadata: { caption: 'Uploaded from RN' }
        });

      if (dbError) throw dbError;

      console.log('Upload successful!');

    } catch (err) {
      console.error('Upload failed inside function:', err.message);
      throw err;
    }
  };

  const deletePhoto = async (filename) => {
    try {
      setBusy(true);

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filename]);

      if (error) {
        Alert.alert('Error', 'Delete failed: ' + error.message);
      } else {
        setSelectedPhoto(null);
        await loadPhotos();
      }
    } catch (err) {
      Alert.alert('Oups', 'Une erreur inconnue a survenue veuillez reesayez plus tard.');
    } finally {
      setBusy(false);
    }
  };

  const handleTakePhoto = async () => {
    if(NbPhotoTaken >= MAX_PHOTOS){
      getAlertRef().current?.showAlert(
        "Photo maximum",
        "Vous avez déjà upload le nombre maximum de photos, pour enregristrer plus de photos évoluez vers notre offre premium",
        true,
        "Evoluez",
        null,
        true,
        "Non merci",
        null
      );
      return;
    }
    SetNbPhotoTaken(NbPhotoTaken + 1);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) queuePhotos(result.assets);
  };

  const handlePickFromGallery = async () => {
    if(NbPhotoTaken >= MAX_PHOTOS){
      getAlertRef().current?.showAlert(
        "Photo maximum",
        "Vous avez déjà upload le nombre maximum de photos, pour enregristrer plus de photos évoluez vers notre offre premium",
        true,
        "Evoluez",
        null,
        true,
        "Non merci",
        null
      );
      return;
    }
    SetNbPhotoTaken(NbPhotoTaken + 1);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled) queuePhotos(result.assets);
  };

  const renderPhotoItem = ({ item }) => (
    <TouchableOpacity style={styles.photoCard} onPress={() => setSelectedPhoto(item)}>
      <Image source={{ uri: item.signed_url }} style={styles.thumbnail} />
      <Text style={styles.photoFilename} numberOfLines={1}>{item.filename}</Text>
    </TouchableOpacity>
  );

  const renderPendingItem = ({ item }) => (
    <View style={styles.pendingCard}>
      <Image source={{ uri: item.uri }} style={styles.pendingThumb} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Gestionnaire Photo</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleTakePhoto}>
          <Text style={styles.buttonText}>prendre une Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary} onPress={handlePickFromGallery}>
          <Text style={styles.buttonText}>Gallerie</Text>
        </TouchableOpacity>
      </View>

      {pendingAssets.length > 0 && (
        <View style={styles.pendingSection}>
          <Text style={styles.pendingTitle}>Attente de l'Upload</Text>
          <FlatList
            data={pendingAssets}
            horizontal
            renderItem={renderPendingItem}
            keyExtractor={(item, index) => index.toString()}
            style={{ marginBottom: 8 }}
          />
          <TouchableOpacity style={styles.uploadAllButton} onPress={uploadQueuedPhotos} disabled={busy}>
            <Text style={styles.uploadAllText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      )}

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {loadingPhotos ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={photos}
            numColumns={2}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id ? item.id.toString() : item.filename}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </Animated.View>

      {busy && (
        <View style={styles.busyOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <Modal visible={selectedPhoto !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPhoto(null)}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
            {selectedPhoto && (
              <Image source={{ uri: selectedPhoto.signed_url }} style={styles.fullImage} />
            )}
            {selectedPhoto && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePhoto(selectedPhoto.filename)}
              >
                <Text style={styles.deleteText}>Supprimer Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f3f7' },
  headerBar: { padding: 16, backgroundColor: '#1c1c1e', paddingTop: 60 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  actionRow: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
  buttonPrimary: { flex: 1, backgroundColor: '#0a84ff', padding: 14, borderRadius: 12, marginRight: 8 },
  buttonSecondary: { flex: 1, backgroundColor: '#30d158', padding: 14, borderRadius: 12, marginLeft: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  pendingSection: { padding: 16, backgroundColor: '#fff', marginBottom: 10 },
  pendingTitle: { fontWeight: '700', marginBottom: 8, fontSize: 16 },
  pendingCard: { marginRight: 8, borderRadius: 10, overflow: 'hidden' },
  pendingThumb: { width: 80, height: 80, borderRadius: 8 },
  uploadAllButton: { backgroundColor: '#007aff', padding: 12, borderRadius: 10, marginTop: 10 },
  uploadAllText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  photoCard: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 12, padding: 8, elevation: 2 },
  thumbnail: { width: '100%', aspectRatio: 1, borderRadius: 8 },
  photoFilename: { marginTop: 6, fontSize: 12, fontWeight: '600' },
  busyOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  closeButton: { alignSelf: 'flex-end', padding: 10 },
  closeText: { fontSize: 18, fontWeight: '700', color: '#333' },
  fullImage: { width: '100%', height: 300, resizeMode: 'contain', marginVertical: 10 },
  deleteButton: { backgroundColor: '#ff3b30', padding: 12, borderRadius: 10 },
  deleteText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
