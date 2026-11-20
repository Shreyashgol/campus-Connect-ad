import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getConversations, getUserProfile } from '../src/services/api';
import ConversationCard from '../src/components/ConversationCard';
import LoadingIndicator from '../src/components/LoadingIndicator';
import ErrorMessage from '../src/components/ErrorMessage';

/**
 * ConversationScreen Component (Stage 3 Upgraded)
 * 
 * WHAT IT DOES:
 * Displays active conversations with message previews, category chips
 * (All, DMs, Groups, Announcements), search filtering, and focus-based refresh.
 * 
 * WHY IT EXISTS:
 * Serves as the primary message inbox and campus noticeboard for CampusConnect.
 * 
 * HOW IT WORKS:
 * 1. Fetches conversations via `getConversations()` on focus.
 * 2. Enriches each record with the creator's name via `getUserProfile()`.
 * 3. Provides instant search and category filtering (All, DMs, Groups, Announcements).
 * 4. Navigates to Chat stack on selection.
 */

const ConversationScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'DM' | 'GROUP' | 'ANNOUNCEMENTS'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Fetch Conversations & Resolve Display Profiles
   */
  const loadConversations = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage('');

    try {
      const rawList = await getConversations();

      const enrichedList = await Promise.all(
        rawList.map(async (convo) => {
          if (!convo.createdBy) {
            return { ...convo, createdByName: null };
          }
          try {
            const profile = await getUserProfile(convo.createdBy);
            return {
              ...convo,
              createdByName: profile?.name ? `Created by ${profile.name}` : `Creator #${convo.createdBy}`,
            };
          } catch {
            return {
              ...convo,
              createdByName: `Creator #${convo.createdBy}`,
            };
          }
        })
      );

      setConversations(enrichedList);
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
      loadConversations();
    }, [loadConversations])
  );

  // Client-side search and category filtering
  const filteredConversations = conversations.filter((c) => {
    const name = (c.name || '').toLowerCase();
    const isAnnouncement =
      name.includes('announcement') ||
      name.includes('notice') ||
      c.type === 'ANNOUNCEMENT';
    const isGroup = c.type === 'GROUP' || (Array.isArray(c.participants_ids) && c.participants_ids.length > 2);
    const isDM = !isGroup && !isAnnouncement;

    // 1. Category check
    if (categoryFilter === 'ANNOUNCEMENTS' && !isAnnouncement) return false;
    if (categoryFilter === 'GROUP' && (!isGroup || isAnnouncement)) return false;
    if (categoryFilter === 'DM' && (!isDM || isAnnouncement)) return false;

    // 2. Search query check
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = name.includes(q);
    const creatorMatch = (c.createdByName || '').toLowerCase().includes(q);
    return nameMatch || creatorMatch;
  });

  return (
    <View style={styles.screen}>
      {/* Search Header */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats and notices..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {!!searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.chipsRow}>
        {[
          { key: 'ALL', label: 'All Chats' },
          { key: 'DM', label: 'Direct Messages' },
          { key: 'GROUP', label: 'Groups' },
          { key: 'ANNOUNCEMENTS', label: '📢 Notices' },
        ].map((chip) => {
          const isActive = categoryFilter === chip.key;
          return (
            <TouchableOpacity
              key={chip.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setCategoryFilter(chip.key)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadConversations(true)} />
        }
      >
        {loading && <LoadingIndicator message="Updating conversations..." />}

        {!loading && !!errorMessage && (
          <ErrorMessage
            title="Connection Notice"
            message={errorMessage}
            onRetry={() => loadConversations()}
          />
        )}

        {!loading && !errorMessage && conversations.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No Conversations Yet</Text>
            <Text style={styles.emptySubtitle}>
              Connect with classmates or create an announcement channel!
            </Text>
            <TouchableOpacity
              style={styles.findUsersButton}
              onPress={() => navigation.navigate('AllUsers')}
            >
              <Text style={styles.findUsersText}>Find Classmates</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !errorMessage && conversations.length > 0 && filteredConversations.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No matching chats</Text>
            <Text style={styles.emptySubtitle}>
              No conversations found for current filters.
            </Text>
            <TouchableOpacity
              style={styles.clearFilterBtn}
              onPress={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
              }}
            >
              <Text style={styles.clearFilterText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !errorMessage && filteredConversations.length > 0 && (
          <View style={styles.list}>
            {filteredConversations.map((item, index) => (
              <ConversationCard
                key={item.id || index}
                conversation={item}
                onPress={() => {
                  navigation.navigate('Chat', {
                    data: {
                      name: item.name || 'Chat',
                      conversationId: item.id,
                      type: item.type,
                      participants: Array.isArray(item.participants_ids) ? item.participants_ids : [],
                    },
                  });
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  searchBarContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#222',
  },
  clearBtn: {
    paddingHorizontal: 8,
  },
  clearBtnText: {
    fontSize: 16,
    color: '#888',
  },
  chipsRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f2f5',
  },
  chipActive: {
    backgroundColor: '#0066cc',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    flexGrow: 1,
  },
  list: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  findUsersButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  findUsersText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearFilterBtn: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  clearFilterText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ConversationScreen;
