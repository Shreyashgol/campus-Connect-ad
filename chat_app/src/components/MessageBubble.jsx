import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { formatMessageTime } from '../utils/formatters';

/**
 * MessageBubble Component (Stage 3 Upgraded)
 * 
 * WHAT IT DOES:
 * Renders individual chat message bubbles with sent vs. received layout,
 * sender identification, timestamps, photo preview attachments, and
 * campus announcement notice styling.
 * 
 * WHY IT EXISTS:
 * Encapsulates message presentation logic for the core chat interface.
 * 
 * INPUT:
 *   - message: object { id, content, imageInfo, senderId, createdAt, timestamp }
 *   - isSentByMe: boolean
 *   - senderName: string
 *   - isAnnouncement: boolean
 */
export default function MessageBubble({
  message,
  isSentByMe = false,
  senderName,
  isAnnouncement = false,
}) {
  const hasImage = !!message.imageInfo;
  const hasText = !!message.content;
  const timeFormatted = formatMessageTime(message.timestamp || message.createdAt || message.created_at);

  return (
    <View
      style={[
        styles.row,
        isAnnouncement
          ? styles.rowAnnouncement
          : isSentByMe
          ? styles.rowSent
          : styles.rowReceived,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isAnnouncement
            ? styles.bubbleAnnouncement
            : isSentByMe
            ? styles.bubbleSent
            : styles.bubbleReceived,
        ]}
      >
        {/* Campus Announcement Header Badge */}
        {isAnnouncement && (
          <View style={styles.announcementHeader}>
            <Text style={styles.announcementBadgeText}>📢 CAMPUS ANNOUNCEMENT</Text>
          </View>
        )}

        {/* Sender Name for Received Messages */}
        {!isSentByMe && !isAnnouncement && !!senderName && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}

        {/* Image Attachment Preview */}
        {hasImage && (
          <Image
            source={{ uri: message.imageInfo }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Message Text Content */}
        {hasText && (
          <Text
            style={[
              styles.text,
              isAnnouncement
                ? styles.textAnnouncement
                : isSentByMe
                ? styles.textSent
                : styles.textReceived,
            ]}
          >
            {message.content}
          </Text>
        )}

        {/* Timestamp */}
        {!!timeFormatted && (
          <Text
            style={[
              styles.time,
              isAnnouncement
                ? styles.timeAnnouncement
                : isSentByMe
                ? styles.timeSent
                : styles.timeReceived,
            ]}
          >
            {timeFormatted}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  rowSent: {
    justifyContent: 'flex-end',
  },
  rowReceived: {
    justifyContent: 'flex-start',
  },
  rowAnnouncement: {
    justifyContent: 'center',
    marginVertical: 8,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleSent: {
    backgroundColor: '#0066cc',
    borderBottomRightRadius: 2,
  },
  bubbleReceived: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 2,
  },
  bubbleAnnouncement: {
    backgroundColor: '#fff8e1',
    borderWidth: 1,
    borderColor: '#ffe082',
    maxWidth: '94%',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  announcementHeader: {
    marginBottom: 6,
  },
  announcementBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f57f17',
    letterSpacing: 0.5,
  },
  senderName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  image: {
    width: 220,
    height: 160,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#ddd',
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  textSent: {
    color: '#ffffff',
  },
  textReceived: {
    color: '#1a1a1a',
  },
  textAnnouncement: {
    color: '#3e2723',
    fontWeight: '500',
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeSent: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  timeReceived: {
    color: '#888',
  },
  timeAnnouncement: {
    color: '#8d6e63',
  },
});
