import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, FlatList } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import FtpService from '@anttech/react-native-ftp';
import { debbug_log } from '../util/debbug.js';
import { getAlertRef } from '../util/AlertService.js';

const ProductPhotos = ({ navigation, route }) => {
    const [photos, setPhotos] = useState([]);
    const list_photos = [];
    const session_id  = route.params.id;

    const savePhotoLocally = async (uri) => {
        try {
            const folderPath = `${RNFS.DocumentDirectoryPath}/product_photos`;
            const fileName = `photo_${Date.now()}.jpg`;
            const filePath = `${folderPath}/${fileName}`;

            // Ensure the folder exists
            const folderExists = await RNFS.exists(folderPath);
            if (!folderExists) {
                await RNFS.mkdir(folderPath);
            }

            list_photos.push(filePath);

            // Copy the photo to the local folder
            await RNFS.copyFile(uri, filePath);
            return filePath;

        } catch (error) {
            console.error('Error saving photo locally:', error);
            Alert.alert('Error', 'Failed to save the photo.');
            return null;
        }
    };

    const upload_db = async (photoPath, fournisseurId) => {
        try {
            const response = await fetch('http://backend-logistique-api-latest.onrender.com/upload_photo.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_fournisseur: fournisseurId,
                    photo_path: photoPath,
                }),
            });

            const result = await response.json();
            if (result.success) {
                debbug_log('Photo uploaded to DB successfully', 'green');
                getAlertRef().current?.showAlert(
                    'Succès', 
                    'Les photos ont été transmises avec succès. Vous pouvez désormais utilisez l\'application',
                    true,
                    "continuer",
                    () => navigation.navigate("Accueil")
                );
            } else {
                debbug_log('Failed to upload photo to DB: ' + result.message, 'red');
            }
        } catch (error) {
            debbug_log('Error uploading photo to DB: ' + error, 'red');
        }
    };

    const transferLocalToFtp = async (fournisseurId) => {
        const host = '	ftpupload.net';
        const port = 21;
        const username = 'if0_37377007';
        const password = 'bujsYxINZZBY4';
        const remoteFolder = '/arena.ct.ws/htdocs/photo_fourni';

        try {
            await FtpService.setup(host, port, username, password);
            debbug_log('FTP connection successful', 'green');

            for (let i = 0; i < photos.length; i++) {
                const localPath = photos[i];
                const remotePath = `${remoteFolder}photo_${Date.now()}_${i}.jpg`;

                // Upload photo to FTP server
                const result = await FtpService.uploadFile(localPath, remotePath);
                if (result) {
                    debbug_log(`Photo uploaded to FTP: ${remotePath}`, 'green');

                    // Save photo path to the database
                    await upload_db(remotePath, fournisseurId);
                } else {
                    debbug_log(`Failed to upload photo to FTP: ${localPath}`, 'red');
                }
            }

            Alert.alert('Succès', 'Photos téléchargées avec succès.');
            navigation.navigate('Accueil');
        } catch (error) {
            debbug_log('FTP upload error: ' + error, 'red');
            Alert.alert('Erreur', 'Échec du téléchargement des photos.');
        }
    };

    const handleCamera = async () => {
        const result = await launchCamera({ mediaType: 'photo', saveToPhotos: false });
        if (result.assets && result.assets.length > 0) {
            const photoUri = result.assets[0].uri;
            const savedPath = await savePhotoLocally(photoUri);
            if (savedPath) {
                setPhotos((prevPhotos) => [...prevPhotos, savedPath]);
            }
        }
    };

    const handleGallery = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 });
        if (result.assets && result.assets.length > 0) {
            for (const asset of result.assets) {
                const savedPath = await savePhotoLocally(asset.uri);
                if (savedPath) {
                    setPhotos((prevPhotos) => [...prevPhotos, savedPath]);
                }
            }
        }
    };

    const renderPhotoItem = ({ item }) => (
        <Image source={{ uri: `file://${item}` }} style={styles.photo} />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ajouter des photos de vos produits</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleCamera}>
                    <Text style={styles.buttonText}>Prendre une photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleGallery}>
                    <Text style={styles.buttonText}>Choisir depuis la galerie</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={photos}
                keyExtractor={(item, index) => `${item}_${index}`}
                renderItem={renderPhotoItem}
                numColumns={3}
                contentContainerStyle={styles.photoList}
            />
            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                    if (photos.length > 5) {
                        getAlertRef().current?.showAlert(
                            'Erreur', 
                            'Vous ne pouvez télécharger que 5 photos au maximum.',
                            true,
                            "OK",
                            null
                        );
                    } else {
                        transferLocalToFtp(session_id);
                    }
                }}
            >
                <Text style={styles.saveButtonText}>Télécharger les photos</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        minWidth: '40%',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    photoList: {
        marginTop: 10,
    },
    photo: {
        width: 100,
        height: 100,
        margin: 5,
        borderRadius: 8,
    },
    saveButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProductPhotos;