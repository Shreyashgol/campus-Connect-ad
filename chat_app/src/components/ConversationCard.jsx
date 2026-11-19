import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getInitials, truncateText } from '../utils/formatters';

/**
 * ConversationCard Component (Stage 3 Upgraded)
 * 
 * WHAT IT DOES:
 * Renders an individual conversation item with avatars, badges (DM, GROUP, ANNOUNCEMENT),
 * and message previews.
 * 
 * INPUT:
 *   - conversation: object { id, name, type, createdBy, createdByName, participants_ids, lastMessage }
 *   - onPress: () => void
 */
export default function ConversationCard({ conversation, onPress }) {
  const name = conversation.name || 'Conversation';
  const initials = getInitials(name);
  const isAnnouncement =
    (name.toLowerCase().includes('announcement') ||
      name.toLowerCase().includes('notice') ||
      conversation.type === 'ANNOUNCEMENT');
  const isGroup =
    conversation.type === 'GROUP' ||
    (Array.isArray(conversation.participants_ids) && conversation.participants_ids.length > 2);
  const participantCount = Array.isArray(conversation.participants_ids)
    ? conversation.participants_ids.length
    : 0;

  const messagePreview =
    conversation.lastMessage?.content ||
    conversation.lastMessage ||
    conversation.latestMessage ||
    'Tap to view messages';

  return (
    <TouchableOpacity
      style={[styles.card, isAnnouncement && styles.cardAnnouncement]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Avatar Circle */}
      <View
        style={[
          styles.avatar,
          isAnnouncement
            ? styles.avatarAnnouncement
            : isGroup
            ? styles.avatarGroup
            : styles.avatarDM,
        ]}
      >
        <Text style={styles.avatarText}>
          {isAnnouncement ? '📢' : initials}
        </Text>
      </View>

      {/* Main Info */}
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {name}
          </Text>
          <View
            style={[
              styles.badge,
              isAnnouncement
                ? styles.badgeAnnouncement
                : isGroup
                ? styles.badgeGroup
                : styles.badgeDM,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isAnnouncement && styles.badgeTextAnnouncement,
              ]}
            >
              {isAnnouncement ? 'NOTICE' : isGroup ? 'GROUP' : 'DM'}
            </Text>
          </View>
        </View>

        {/* Message preview snippet */}
        <Text style={styles.preview} numberOfLines={1}>
          {truncateText(messagePreview, 40)}
        </Text>

        {/* Subtitle with creator or participant count */}
        <Text style={styles.subtext} numberOfLines={1}>
          {conversation.createdByName || `${participantCount} member(s)`}
        </Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardAnnouncement: {
    borderLeftWidth: 4,
    borderLeftColor: '#f57f17',
    backgroundColor: '#fffdf5',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarDM: {
    backgroundColor: '#0066cc',
  },
  avatarGroup: {
    backgroundColor: '#ff8f00',
  },
  avatarAnnouncement: {
    backgroundColor: '#fff3e0',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeDM: {
    backgroundColor: '#e3f2fd',
  },
  badgeGroup: {
    backgroundColor: '#fff3e0',
  },
  badgeAnnouncement: {
    backgroundColor: '#fff8e1',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  badgeTextAnnouncement: {
    color: '#e65100',
  },
  preview: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  subtext: {
    fontSize: 11,
    color: '#888',
  },
  chevron: {
    fontSize: 22,
    color: '#bbb',
    marginLeft: 6,
  },
});
