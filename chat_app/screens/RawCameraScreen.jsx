import React, { useRef, useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

/**
 * RawCameraScreen Component
 * 
 * WHAT IT DOES:
 * Embeds an in-app live camera viewfinder directly into the React view tree using `expo-camera`.
 * 
 * WHY IT EXISTS:
 * Demonstrates advanced camera integration where custom overlays, flip buttons,
 * and shutter buttons are controlled directly by the React Native UI rather than the OS camera app.
 * 
 * HOW IT WORKS:
 * 1. Uses the `useCameraPermissions` hook to check and request camera permissions.
 * 2. Mounts `<CameraView ref={cameraRef} facing={facing} />`.
 * 3. Tapping the shutter button invokes `cameraRef.current.takePictureAsync()`.
 * 4. Shows captured preview with a "Retake" button.
 */

export default function RawCameraScreen() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const cameraRef = useRef(null);

  // 1. Handle permission loading state
  if (!permission) {
    return <View style={styles.container} />;
  }

  // 2. Request permission if not granted
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Camera access is required to take photos.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // 3. Capture the image using the camera ref
  const takePicture = async () => {
    const camera = cameraRef.current;
    if (camera) {
      try {
        const photo = await camera.takePictureAsync({
          quality: 0.8,
        });
        if (photo && photo.uri) {
          setPhotoUri(photo.uri);
        }
      } catch (err) {
        console.error('Failed to take picture:', err);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // 4. Show captured photo preview with a retake option
  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.controls}>
          <Button title="Retake" onPress={() => setPhotoUri(null)} />
        </View>
      </View>
    );
  }

  // 5. Render live camera view with custom overlay controls
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shutterButton}
          onPress={takePicture}
          accessibilityLabel="Capture photo"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  message: { textAlign: 'center', marginBottom: 12, fontSize: 14, color: '#333' },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: 'contain' },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  button: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
  },
  text: { color: '#fff', fontWeight: 'bold' },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#ccc',
  },
});
