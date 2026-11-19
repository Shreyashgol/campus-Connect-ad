import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * ErrorMessage Component
 * 
 * WHAT IT DOES: Renders a user-friendly error notice banner with an optional Retry button.
 * WHY IT EXISTS: Standardizes error presentation without crashing or displaying raw error objects.
 * INPUT: { title?: string, message: string, onRetry?: () => void }
 */
export default function ErrorMessage({
  title = 'Notice',
  message,
  onRetry,
}) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    borderRadius: 8,
    padding: 14,
    marginVertical: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#b71c1c',
    lineHeight: 18,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#c62828',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
