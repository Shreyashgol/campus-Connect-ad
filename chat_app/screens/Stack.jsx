import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConversationScreen from './ConversationScreen';
import ChatScreen from './ChatScreen';
import GroupInfoScreen from './GroupInfoScreen';

/**
 * Conversations Stack Navigator (Stage 3 Upgraded)
 * 
 * WHAT IT DOES:
 * Manages transitions between:
 * 1. Conversation inbox list
 * 2. Active chat thread
 * 3. Group Information screen
 * 
 * WHY IT EXISTS:
 * Provides hierarchical navigation with back buttons and header actions.
 */

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="Conversation"
      screenOptions={{
        headerBackButtonDisplayMode: 'generic',
      }}
    >
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{ title: 'Campus Conversations' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route, navigation }) => {
          const convo = route?.params?.data || {};
          const isGroup = convo.type === 'GROUP' || (Array.isArray(convo.participants) && convo.participants.length > 2);

          return {
            headerTitle: convo.name || 'Chat',
            headerRight: () => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('GroupInfo', {
                    conversation: {
                      id: convo.conversationId,
                      name: convo.name,
                      type: convo.type || (isGroup ? 'GROUP' : 'DM'),
                      participants_ids: convo.participants,
                    },
                  })
                }
                style={{ paddingHorizontal: 10, paddingVertical: 4 }}
                accessibilityLabel="Group Information"
              >
                <Text style={{ fontSize: 18, color: '#0066cc' }}>ℹ️</Text>
              </TouchableOpacity>
            ),
          };
        }}
      />
      <Stack.Screen
        name="GroupInfo"
        component={GroupInfoScreen}
        options={{ title: 'Group Details' }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigation;
