import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { getUserProfile } from '../src/services/api';
import { getInitials } from '../src/utils/formatters';
import LoadingIndicator from '../src/components/LoadingIndicator';

/**
 * GroupInfoScreen Component (Stage 3)
 * 
 * WHAT IT DOES:
 * Displays group conversation metadata: group title, member count,
 * creator attribution, and the full list of group participants with bios.
 * 
 * WHY IT EXISTS:
 * Enables students to see who belongs to a campus group chat without inventing
 * unconfirmed admin or permission editing features.
 * 
 * HOW IT WORKS:
 * 1. Receives `conversation` object from route parameters.
 * 2. Fetches user profiles for all participant IDs in parallel via `getUserProfile()`.
 * 3. Renders group details, participant count, and list of members.
 * 
 * INPUT:
 *   - route.params: { conversation: { id, name, type, createdBy, createdByName, participants_ids } }
 */

const GroupInfoScreen = ({ route, navigation }) => {
  const conversation = route?.params?.conversation || {};
  const participants = Array.isArray(conversation.participants_ids)
    ? conversation.participants_ids
    : [];

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadMembers() {
      if (participants.length === 0) {
        setLoading(false);
        return;
      }

      const fetchedMembers = await Promise.all(
        participants.map(async (pId) => {
          try {
            const profile = await getUserProfile(pId);
            return profile || { id: pId, name: `Student #${pId}` };
          } catch {
            return { id: pId, name: `Student #${pId}` };
          }
        })
      );

      if (isMounted) {
        setMembers(fetchedMembers);
        setLoading(false);
      }
    }

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [participants]);

  const groupName = conversation.name || 'Campus Group';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Group Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.groupAvatar}>
          <Text style={styles.groupAvatarText}>{getInitials(groupName)}</Text>
        </View>
        <Text style={styles.groupTitle}>{groupName}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {conversation.type === 'GROUP' ? 'CAMPUS GROUP' : 'CONVERSATION'}
          </Text>
        </View>
        <Text style={styles.groupSub}>
          {conversation.createdByName || `Group ID #${conversation.id || 'N/A'}`}
        </Text>
      </View>

      {/* Participants Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Group Members</Text>
        <Text style={styles.sectionCount}>{members.length} member(s)</Text>
      </View>

      {loading ? (
        <LoadingIndicator message="Loading member profiles..." />
      ) : members.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No participant information available.</Text>
        </View>
      ) : (
        <View style={styles.memberList}>
          {members.map((member, index) => (
            <View key={member.id || index} style={styles.memberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {getInitials(member.name || 'Student')}
                </Text>
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{member.name || `Student #${member.id}`}</Text>
                {!!member.bio && (
                  <Text style={styles.memberBio} numberOfLines={1}>
                    {member.bio}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Close/Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Return to Chat</Text>
      </TouchableOpacity>
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
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  groupAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ff8f00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupAvatarText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  groupTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  badge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ef6c00',
  },
  groupSub: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionCount: {
    fontSize: 13,
    color: '#666',
  },
  emptyBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
  memberList: {
    gap: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eceff1',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  memberBio: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  backButton: {
    backgroundColor: '#eceff1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#37474f',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default GroupInfoScreen;
