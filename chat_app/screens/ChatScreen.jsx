import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
  getMessages,
  getUserProfile,
  sendTextMessage,
  sendImageMessage,
} from '../src/services/api';
import MessageBubble from '../src/components/MessageBubble';
import LoadingIndicator from '../src/components/LoadingIndicator';
import ErrorMessage from '../src/components/ErrorMessage';

/**
 * ChatScreen Component (Stage 3 Upgraded)
 * 
 * WHAT IT DOES:
 * Core interactive chat screen providing message history, sent/received bubble styles,
 * sender identification, timestamps, camera & gallery photo attachments,
 * campus announcement formatting, and periodic polling.
 * 
 * WHY IT EXISTS:
 * Serves as the primary real-time communication interface between campus students.
 * 
 * HOW IT WORKS:
 * 1. Reads `conversationId` and `participants` from `route.params.data`.
 * 2. Fetches message history via `getMessages()` and resolves member profiles.
 * 3. Polling timer runs every 5 seconds while focused to fetch incoming messages.
 * 4. Image attachments support both OS camera capture and gallery library selection.
 * 5. Supports dedicated announcement notice layouts for campus broadcast groups.
 * 
 * INPUT:
 *   - route.params.data: { conversationId, name, type, participants }
 */

const ChatScreen = ({ navigation, route }) => {
  const conversationData = route?.params?.data || {};
  const conversationId = conversationData.conversationId;
  const conversationName = conversationData.name || 'Chat';
  const participants = Array.isArray(conversationData.participants)
    ? conversationData.participants
    : [];

  const isAnnouncement =
    (conversationName.toLowerCase().includes('announcement') ||
      conversationName.toLowerCase().includes('notice') ||
      conversationData.type === 'ANNOUNCEMENT');

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [participantProfiles, setParticipantProfiles] = useState({});
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);

  // Set of message IDs sent from this device in current session
  const [sentMessageIds, setSentMessageIds] = useState(new Set());

  const scrollViewRef = useRef(null);

  /**
   * Fetch Messages for this Conversation
   */
  const loadMessages = useCallback(
    async (isBackgroundPoll = false) => {
      if (!conversationId) return;
      if (!isBackgroundPoll) {
        setErrorMessage('');
      }

      try {
        const data = await getMessages(conversationId);
        setMessages(data);
      } catch (err) {
        if (!isBackgroundPoll) {
          setErrorMessage(err.message || 'Unable to load message history.');
        }
      }
    },
    [conversationId]
  );

  /**
   * Screen Focus and Periodic Polling
   */
  useFocusEffect(
    useCallback(() => {
      if (!conversationId) return;

      loadMessages(false);

      const intervalId = setInterval(() => {
        loadMessages(true);
      }, 5000);

      return () => clearInterval(intervalId);
    }, [conversationId, loadMessages])
  );

  /**
   * Resolve Participant Profiles
   */
  useEffect(() => {
    let isMounted = true;

    async function resolveParticipants() {
      if (!participants || participants.length === 0) return;

      const profileMap = {};
      await Promise.all(
        participants.map(async (pId) => {
          try {
            const profile = await getUserProfile(pId);
            if (profile && profile.name) {
              profileMap[pId] = profile.name;
            }
          } catch {
            profileMap[pId] = `User #${pId}`;
          }
        })
      );

      if (isMounted) {
        setParticipantProfiles(profileMap);
      }
    }

    resolveParticipants();

    return () => {
      isMounted = false;
    };
  }, [participants]);

  /**
   * Send Text Message
   */
  const handleSendMessage = async () => {
    const textToSend = currentMessage.trim();
    if (!textToSend) return;

    if (!conversationId) {
      Alert.alert('Error', 'Missing conversation ID. Cannot send message.');
      return;
    }

    setSending(true);
    try {
      const response = await sendTextMessage(conversationId, textToSend);

      if (response && response.id) {
        setSentMessageIds((prev) => new Set(prev).add(response.id));
      }

      setCurrentMessage('');
      await loadMessages(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      Alert.alert('Send Failed', err.message || 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  /**
   * Launch Native Camera
   */
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      processSelectedAsset(result.assets[0]);
    } catch (err) {
      Alert.alert('Camera Error', err.message || 'Failed to capture photo.');
    }
  };

  /**
   * Launch Photo Gallery Picker
   */
  const handleChooseFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Media library access is required to choose photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      processSelectedAsset(result.assets[0]);
    } catch (err) {
      Alert.alert('Gallery Error', err.message || 'Failed to pick photo.');
    }
  };

  /**
   * Process Selected Photo Asset
   */
  const processSelectedAsset = (asset) => {
    setSelectedImagePreview(asset.uri);

    Alert.alert('Send Photo', 'Send this image to the conversation?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => setSelectedImagePreview(null),
      },
      {
        text: 'Send',
        onPress: async () => {
          if (!asset.base64) {
            Alert.alert('Error', 'Unable to encode image data.');
            return;
          }
          setSending(true);
          try {
            const base64Payload = `data:image/jpeg;base64,${asset.base64}`;
            const resp = await sendImageMessage(conversationId, base64Payload);
            if (resp && resp.id) {
              setSentMessageIds((prev) => new Set(prev).add(resp.id));
            }
            setSelectedImagePreview(null);
            await loadMessages(false);
          } catch (err) {
            Alert.alert('Upload Failed', err.message || 'Failed to send image.');
          } finally {
            setSending(false);
          }
        },
      },
    ]);
  };

  /**
   * Attachment Action Prompt (Camera vs. Gallery)
   */
  const handleAttachmentPress = () => {
    Alert.alert('Attach Photo', 'Choose photo source:', [
      {
        text: 'Take Photo with Camera',
        onPress: handleTakePhoto,
      },
      {
        text: 'Choose from Gallery',
        onPress: handleChooseFromGallery,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  if (!conversationId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.missingParamText}>No conversation selected.</Text>
        <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
          <Text style={styles.returnButtonText}>Back to Chats</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const memberNames = Object.values(participantProfiles);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Announcement Notice Banner (if applicable) */}
      {isAnnouncement && (
        <View style={styles.announcementBanner}>
          <Text style={styles.announcementBannerText}>
            📢 Official Campus Notice Channel • Broadcast Messages
          </Text>
        </View>
      )}

      {/* Subheader: Member List */}
      {!isAnnouncement && memberNames.length > 0 && (
        <View style={styles.membersBar}>
          <Text style={styles.membersText} numberOfLines={1}>
            Members: {memberNames.join(', ')}
          </Text>
        </View>
      )}

      {/* Message History Thread */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        {loading && <LoadingIndicator message="Loading message history..." />}

        {!loading && !!errorMessage && (
          <ErrorMessage
            title="Connection Notice"
            message={errorMessage}
            onRetry={() => loadMessages(false)}
          />
        )}

        {!loading && !errorMessage && messages.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>{isAnnouncement ? '📢' : '👋'}</Text>
            <Text style={styles.emptyTitle}>
              {isAnnouncement ? 'No Campus Announcements' : 'Start the Conversation'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isAnnouncement
                ? 'Official campus notices and events will appear here.'
                : 'No messages here yet. Say hello to get things started!'}
            </Text>
          </View>
        )}

        {!loading &&
          messages.map((item, index) => {
            const isSentByMe = sentMessageIds.has(item.id) || item.isSelf === true;
            const senderName = item.senderId
              ? participantProfiles[item.senderId] || `User #${item.senderId}`
              : null;

            return (
              <MessageBubble
                key={item.id || index}
                message={item}
                isSentByMe={isSentByMe}
                senderName={senderName}
                isAnnouncement={isAnnouncement}
              />
            );
          })}
      </ScrollView>

      {/* Selected Image Preview Bar */}
      {selectedImagePreview && (
        <View style={styles.previewBar}>
          <Image source={{ uri: selectedImagePreview }} style={styles.previewThumb} />
          <Text style={styles.previewText}>Photo selected for sending</Text>
          <TouchableOpacity onPress={() => setSelectedImagePreview(null)}>
            <Text style={styles.cancelPreviewText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Message Composer */}
      <View style={styles.composerBar}>
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={handleAttachmentPress}
          disabled={sending}
          accessibilityLabel="Attach photo from Camera or Gallery"
        >
          <Text style={styles.attachIcon}>📷</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.composerInput}
          placeholder={isAnnouncement ? 'Post an announcement...' : 'Message...'}
          placeholderTextColor="#888"
          value={currentMessage}
          onChangeText={setCurrentMessage}
          multiline
          maxLength={1000}
          editable={!sending}
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!currentMessage.trim() || sending) && styles.sendBtnDisabled,
          ]}
          disabled={!currentMessage.trim() || sending}
          onPress={handleSendMessage}
          accessibilityLabel="Send message"
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f5',
  },
  announcementBanner: {
    backgroundColor: '#fff8e1',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe082',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  announcementBannerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f57f17',
  },
  membersBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  membersText: {
    fontSize: 12,
    color: '#666',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    lineHeight: 18,
  },
  missingParamText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  returnButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  returnButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    gap: 10,
  },
  previewThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  previewText: {
    flex: 1,
    fontSize: 12,
    color: '#555',
  },
  cancelPreviewText: {
    color: '#d32f2f',
    fontWeight: '600',
    fontSize: 13,
    paddingHorizontal: 8,
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#d6d6d6',
    gap: 8,
  },
  attachBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachIcon: {
    fontSize: 22,
  },
  composerInput: {
    flex: 1,
    backgroundColor: '#f1f3f4',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
    maxHeight: 100,
    color: '#222',
  },
  sendBtn: {
    backgroundColor: '#0066cc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#b0bec5',
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
