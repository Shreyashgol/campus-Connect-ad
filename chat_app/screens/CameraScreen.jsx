import React, { useState } from 'react';
import { Button, Image, View, StyleSheet, Alert, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/**
 * CameraScreen Component
 * 
 * WHAT IT DOES:
 * Captures photos using the native device camera UI via `expo-image-picker`.
 * 
 * WHY IT EXISTS:
 * Demonstrates system camera intent access, allowing students to capture photos
 * without having to build a custom camera viewfinder from scratch.
 * 
 * HOW IT WORKS:
 * 1. Requests camera permissions from the mobile operating system.
 * 2. Launches the native system camera app via `ImagePicker.launchCameraAsync`.
 * 3. Safely verifies `result.canceled` and extracts the photo URI.
 * 4. Displays the captured image.
 */

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState(null);

  const takePhotoWithCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Denied',
          'Camera access permission is required to capture photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Camera Error', err.message || 'Failed to capture photo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Camera</Text>
      <Text style={styles.subtitle}>Captures photo via native OS camera intent</Text>

      <Button title="Take Photo with Camera" onPress={takePhotoWithCamera} />

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Text style={styles.uriText} numberOfLines={2}>
            {imageUri}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  uriText: {
    marginTop: 8,
    fontSize: 11,
    color: '#888',
    maxWidth: 250,
    textAlign: 'center',
  },
});
