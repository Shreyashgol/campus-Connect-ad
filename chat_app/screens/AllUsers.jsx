import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUsers, createConversation } from '../src/services/api';
import UserItem from '../src/components/UserItem';
import LoadingIndicator from '../src/components/LoadingIndicator';
import ErrorMessage from '../src/components/ErrorMessage';

/**
 * AllUsers Component (Stage 2 Upgraded)
 * 
 * WHAT IT DOES:
 * Provides user discovery, search filtering, multi-user participant selection,
 * and robust creation of Direct Message (DM) and Campus Group conversations.
 * 
 * WHY IT EXISTS:
 * Enables students to find classmates and initiate new discussions on campus.
 * 
 * HOW IT WORKS:
 * 1. Fetches user directory via `getUsers()` on screen focus or pull-to-refresh.
 * 2. Allows instant local searching across student names and bios.
 * 3. Supports selecting and deselecting participants with duplicate prevention.
 * 4. Enforces validation rules before dispatching `createConversation()`.
 * 5. On success, navigates directly to the Conversations inbox.
 * 
 * INPUT:
 *   - navigation: React Navigation object for screen transitions.
 */

const AllUsers = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Creation form state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [type, setType] = useState('DM'); // Default to DM for quick 1-on-1 chats
  const [convoName, setConvoName] = useState('');

  /**
   * Fetch All Users from Backend
   */
  const loadUsers = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage('');

    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to connect to backend. Verify server is running on http://localhost:3000.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  /**
   * Toggle Participant Selection
   * 
   * WHAT IT DOES: Selects user if unselected; deselects if currently selected.
   * WHY IT EXISTS: Guarantees no duplicate participant IDs can be submitted.
   * INPUT: userId (string or number).
   */
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  /**
   * Reset Form
   */
  const handleReset = () => {
    setSelectedUsers([]);
    setConvoName('');
    setType('DM');
  };

  /**
   * Validate and Create Conversation
   * 
   * WHAT IT DOES: Validates user selection & title, calls API, and provides feedback.
   * WHY IT EXISTS: Prevents empty or malformed conversation requests from reaching the backend.
   */
  const handleCreateConversation = async () => {
    if (!type) {
      Alert.alert('Selection Required', 'Please select DM or Campus Group.');
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert(
        'Participants Required',
        'Please select at least one classmate from the list below.'
      );
      return;
    }

    if (type === 'DM' && selectedUsers.length !== 1) {
      Alert.alert(
        'Direct Message Requirement',
        'Direct messages connect exactly 2 people. Please select 1 recipient, or switch to Campus Group.'
      );
      return;
    }

    if (type === 'GROUP' && !convoName.trim()) {
      Alert.alert('Group Title Required', 'Please enter a name for the campus group.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedUserObjects = users.filter((u) => selectedUsers.includes(u.id));
      const defaultName =
        type === 'DM'
          ? (selectedUserObjects[0]?.name ? `DM with ${selectedUserObjects[0].name}` : 'Direct Message')
          : convoName.trim();

      const created = await createConversation({
        type,
        name: convoName.trim() || defaultName,
        participants_ids: selectedUsers,
      });

      Alert.alert('Conversation Created', 'Your conversation is ready!', [
        {
          text: 'Open Chats',
          onPress: () => {
            handleReset();
            navigation.navigate('Conversations');
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Creation Error', err.message || 'Failed to create conversation.');
    } finally {
      setSubmitting(false);
    }
  };

  // Local search filter
  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const nameMatch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const bioMatch = (u.bio || '').toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || bioMatch;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadUsers(true)} />
      }
    >
      {/* Creation Configuration Card */}
      <View style={styles.creationCard}>
        <Text style={styles.cardHeader}>New Conversation</Text>

        {/* Type Switcher */}
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeTab,
              type === 'DM' && styles.typeTabActiveDM,
            ]}
            onPress={() => setType('DM')}
          >
            <Text
              style={[
                styles.typeTabText,
                type === 'DM' && styles.typeTabTextActive,
              ]}
            >
              Direct Message (DM)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeTab,
              type === 'GROUP' && styles.typeTabActiveGroup,
            ]}
            onPress={() => setType('GROUP')}
          >
            <Text
              style={[
                styles.typeTabText,
                type === 'GROUP' && styles.typeTabTextActive,
              ]}
            >
              Campus Group
            </Text>
          </TouchableOpacity>
        </View>

        {/* Group Name Field */}
        {type === 'GROUP' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Group Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. CS Study Hub, Hackathon Team"
              placeholderTextColor="#888"
              value={convoName}
              onChangeText={setConvoName}
            />
          </View>
        )}

        {/* Selected Participants Chips Bar */}
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            Selected: <Text style={styles.selectionCount}>{selectedUsers.length}</Text>{' '}
            participant(s)
          </Text>
          {selectedUsers.length > 0 && (
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.clearSelectionText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (selectedUsers.length === 0 || submitting) && styles.createButtonDisabled,
          ]}
          disabled={selectedUsers.length === 0 || submitting}
          onPress={handleCreateConversation}
        >
          <Text style={styles.createButtonText}>
            {submitting ? 'Creating...' : `Start ${type === 'DM' ? 'Direct Message' : 'Group'}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Directory & Search Section */}
      <View style={styles.directoryHeaderRow}>
        <Text style={styles.directoryTitle}>Campus Directory</Text>
        <Text style={styles.directoryCount}>{filteredUsers.length} found</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search students by name or bio..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {!!searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading Indicator */}
      {loading && <LoadingIndicator message="Fetching campus students..." />}

      {/* Error Notice */}
      {!loading && !!errorMessage && (
        <ErrorMessage
          title="Connection Notice"
          message={errorMessage}
          onRetry={() => loadUsers()}
        />
      )}

      {/* Empty State */}
      {!loading && !errorMessage && users.length === 0 && (
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyText}>No registered students found.</Text>
        </View>
      )}

      {/* User List */}
      {!loading && !errorMessage && filteredUsers.length > 0 && (
        <View style={styles.userList}>
          {filteredUsers.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              isSelected={selectedUsers.includes(user.id)}
              onToggle={() => toggleUserSelection(user.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  contentContainer: {
    padding: 14,
  },
  creationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  typeTabActiveDM: {
    backgroundColor: '#e3f2fd',
    borderColor: '#0066cc',
  },
  typeTabActiveGroup: {
    backgroundColor: '#fff3e0',
    borderColor: '#ef6c00',
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  typeTabTextActive: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    backgroundColor: '#fafafa',
    color: '#222',
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectionText: {
    fontSize: 13,
    color: '#555',
  },
  selectionCount: {
    fontWeight: 'bold',
    color: '#0066cc',
  },
  clearSelectionText: {
    fontSize: 13,
    color: '#c62828',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#b0bec5',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  directoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  directoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  directoryCount: {
    fontSize: 13,
    color: '#777',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#222',
  },
  clearSearch: {
    padding: 6,
  },
  clearSearchText: {
    color: '#888',
    fontSize: 14,
  },
  emptyCenter: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
  },
  userList: {
    paddingBottom: 24,
  },
});

export default AllUsers;
