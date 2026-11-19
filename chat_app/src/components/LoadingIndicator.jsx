import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * LoadingIndicator Component
 * 
 * WHAT IT DOES: Renders a centered loading spinner with an optional descriptive message.
 * WHY IT EXISTS: Provides consistent loading state UX across all screens.
 * INPUT: { message?: string, size?: 'small' | 'large', color?: string }
 */
export default function LoadingIndicator({
  message = 'Loading...',
  size = 'large',
  color = '#0066cc',
}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {!!message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
