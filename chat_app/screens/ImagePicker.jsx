import React, { useState } from 'react';
import { Button, View, Alert, Image, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/**
 * ImagePickerScreen Component
 * 
 * WHAT IT DOES:
 * Demonstrates system photo gallery picking using `expo-image-picker`.
 * 
 * WHY IT EXISTS:
 * Serves as a media verification screen and hardware testing screen.
 * 
 * HOW IT WORKS:
 * 1. Requests device media library read permissions asynchronously.
 * 2. Launches the native system photo gallery via `launchImageLibraryAsync`.
 * 3. Safely verifies `result.canceled` before accessing `result.assets[0]`.
 * 4. Displays the chosen image in an `<Image>` component.
 */

const ImagePickerScreen = () => {
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Permission to access the media library is required to select photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      // Guard: safely handle user cancellation without crashing
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to open image library.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Media Library Picker</Text>
      <Text style={styles.subtitle}>Test device photo gallery integration</Text>

      <Button title="Choose Image from Gallery" onPress={pickImage} />

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <Text style={styles.uriText} numberOfLines={2}>
            {imageUri}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  previewImage: {
    width: 220,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  uriText: {
    marginTop: 8,
    fontSize: 11,
    color: '#888',
    maxWidth: 240,
    textAlign: 'center',
  },
});

export default ImagePickerScreen;
