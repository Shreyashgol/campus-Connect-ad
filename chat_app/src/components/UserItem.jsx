import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getInitials } from '../utils/formatters';

/**
 * UserItem Component
 * 
 * WHAT IT DOES:
 * Renders an individual student item with toggleable checkbox selection.
 * 
 * WHY IT EXISTS:
 * Reusable user list row used in user discovery and conversation creation.
 * 
 * INPUT:
 *   - user: object { id, name, bio }
 *   - isSelected: boolean
 *   - onToggle: () => void
 */
export default function UserItem({ user, isSelected, onToggle }) {
  const name = user.name || 'Unknown Student';
  const initials = getInitials(name);

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      activeOpacity={0.7}
      onPress={onToggle}
    >
      <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {!!user.bio && (
          <Text style={styles.bio} numberOfLines={1}>{user.bio}</Text>
        )}
      </View>

      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  containerSelected: {
    borderColor: '#0066cc',
    backgroundColor: '#f0f7ff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#78909c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarSelected: {
    backgroundColor: '#0066cc',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  bio: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkboxSelected: {
    borderColor: '#0066cc',
    backgroundColor: '#0066cc',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
