import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import StackNavigation from './screens/Stack';
import AllUsers from './screens/AllUsers';
import ProfileScreen from './screens/ProfileScreen';
import ImagePickerScreen from './screens/ImagePicker';
import CameraScreen from './screens/CameraScreen';
import RawCameraScreen from './screens/RawCameraScreen';

/**
 * Root Application Component (Stage 3 Upgraded)
 * 
 * WHAT IT DOES:
 * Configures the application shell, SafeAreaProvider, and BottomTabNavigator.
 * Houses the primary tabs:
 * 1. Chats (Conversations stack)
 * 2. Find Users (User directory & conversation creation)
 * 3. Profile (Campus profile and system diagnostics)
 * 4. Media utilities (Gallery, Camera, Live Cam)
 */

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Conversations"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Conversations"
            component={StackNavigation}
            options={{ title: 'Chats' }}
          />
          <Tab.Screen
            name="AllUsers"
            component={AllUsers}
            options={{
              headerShown: true,
              title: 'Find Users',
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: true,
              title: 'My Profile',
            }}
          />
          <Tab.Screen
            name="ImagePickerScreen"
            component={ImagePickerScreen}
            options={{
              headerShown: true,
              title: 'Gallery',
            }}
          />
          <Tab.Screen
            name="CameraScreen"
            component={CameraScreen}
            options={{
              headerShown: true,
              title: 'Camera',
            }}
          />
          <Tab.Screen
            name="RawCameraScreen"
            component={RawCameraScreen}
            options={{
              headerShown: false,
              title: 'Live Cam',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
