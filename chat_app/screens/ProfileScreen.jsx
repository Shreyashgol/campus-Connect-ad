import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUsers, getConversations } from '../src/services/api';
import { API_CONFIG } from '../src/config/api';
import { getInitials } from '../src/utils/formatters';
import LoadingIndicator from '../src/components/LoadingIndicator';
import ErrorMessage from '../src/components/ErrorMessage';

/**
 * ProfileScreen Component (Stage 3)
 * 
 * WHAT IT DOES:
 * Displays the student's campus profile information, active conversation stats,
 * and current server connection status without inventing an unauthorized authentication system.
 * 
 * WHY IT EXISTS:
 * Gives students a dedicated profile view to inspect their campus identity,
 * user ID, bio, and connection environment.
 * 
 * HOW IT WORKS:
 * 1. Fetches registered campus users via `getUsers()` and active conversations via `getConversations()`.
 * 2. Selects the primary student profile (first user or student selected by the user).
 * 3. Allows testing different student profiles using a simple "Switch Profile" modal/action for viva demos.
 * 4. Displays student name, ID, bio, enrolled status, and backend connectivity diagnostics.
 * 
 * INPUT: None (reads from centralized API service).
 */

const ProfileScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [conversationsCount, setConversationsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Load Profile Data
   */
  const loadProfileData = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage('');

    try {
      const [fetchedUsers, fetchedConversations] = await Promise.all([
        getUsers(),
        getConversations().catch(() => []),
      ]);

      setUsers(fetchedUsers);
      setConversationsCount(fetchedConversations.length);
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to load profile data from backend.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  const currentUser = users[selectedUserIndex] || null;

  /**
   * Switch Profile (Useful for Viva Demonstration)
   * Allows the examiner to toggle active student identity without requiring login credentials.
   */
  const handleSwitchProfile = () => {
    if (users.length <= 1) {
      Alert.alert('Notice', 'No other student profiles available on backend.');
      return;
    }

    const nextIndex = (selectedUserIndex + 1) % users.length;
    setSelectedUserIndex(nextIndex);
    Alert.alert(
      'Profile Switched',
      `Active testing profile changed to: ${users[nextIndex]?.name || 'Student'}`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadProfileData(true)}
        />
      }
    >
      {loading && <LoadingIndicator message="Loading profile..." />}

      {!loading && !!errorMessage && (
        <ErrorMessage
          title="Profile Notice"
          message={errorMessage}
          onRetry={() => loadProfileData()}
        />
      )}

      {!loading && currentUser && (
        <View style={styles.profileCard}>
          {/* Avatar & Header */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(currentUser.name || 'Student')}
              </Text>
            </View>
            <Text style={styles.userName}>{currentUser.name || 'Campus Student'}</Text>
            <Text style={styles.userRole}>Enrolled Campus Member</Text>
          </View>

          {/* Student Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>About / Bio</Text>
            <Text style={styles.bioText}>
              {currentUser.bio || 'No campus bio added yet.'}
            </Text>
          </View>

          {/* Metadata Cards Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{currentUser.id || 'N/A'}</Text>
              <Text style={styles.statLabel}>Student ID</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{conversationsCount}</Text>
              <Text style={styles.statLabel}>Active Chats</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>Active</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>

          {/* Demo Identity Switcher */}
          {users.length > 1 && (
            <TouchableOpacity
              style={styles.switchButton}
              onPress={handleSwitchProfile}
            >
              <Text style={styles.switchButtonText}>
                Switch Profile for Viva Demo ({selectedUserIndex + 1}/{users.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Backend & Environment Diagnostics Card */}
      <View style={styles.diagnosticsCard}>
        <Text style={styles.diagTitle}>System & Network Diagnostics</Text>
        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>Backend URL:</Text>
          <Text style={styles.diagValue}>{API_CONFIG.BASE_URL}</Text>
        </View>
        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>Port Forwarding:</Text>
          <Text style={styles.diagValue}>adb reverse tcp:3000 tcp:3000</Text>
        </View>
        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>App Environment:</Text>
          <Text style={styles.diagValue}>CampusConnect (Expo SDK 58)</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  contentContainer: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  userRole: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  switchButton: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  switchButtonText: {
    color: '#0066cc',
    fontSize: 13,
    fontWeight: 'bold',
  },
  diagnosticsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  diagTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 10,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  diagLabel: {
    fontSize: 12,
    color: '#777',
  },
  diagValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});

export default ProfileScreen;
