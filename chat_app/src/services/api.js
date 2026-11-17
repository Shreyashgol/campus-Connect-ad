/**
 * API Service Layer
 * 
 * WHAT IT DOES:
 * Encapsulates all HTTP network requests to the backend REST API, providing
 * centralized error handling, timeout management, and consistent response parsing.
 * 
 * WHY IT EXISTS:
 * Screens should focus on UI rendering and user interactions rather than directly
 * managing raw fetch calls, header configurations, status codes, and JSON parsing.
 * 
 * HOW IT WORKS:
 * Uses the native `fetch` API wrapped in an AbortController for timeout protection.
 * Checks HTTP status codes (`response.ok`) and throws user-friendly errors on failure.
 */

import { API_CONFIG } from '../config/api';

/**
 * Core HTTP Request Wrapper
 * 
 * @param {string} endpoint - Relative path (e.g., '/user', '/conversation')
 * @param {object} options - Standard fetch options (method, headers, body)
 * @returns {Promise<any>} Parsed JSON response
 */
async function request(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  const config = {
    ...options,
    signal: controller.signal,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Parse JSON safely
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
    }

    // Check for non-2xx HTTP responses
    if (!response.ok) {
      const errorMsg =
        (data && data.message) ||
        `Server returned error status ${response.status} (${response.statusText})`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    // Provide helpful user-facing error messages for common failure modes
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${API_CONFIG.TIMEOUT_MS / 1000}s. Check if server is running at ${API_CONFIG.BASE_URL}`);
    }

    if (err.message && err.message.includes('Network request failed')) {
      throw new Error(`Cannot connect to server at ${API_CONFIG.BASE_URL}. Ensure the backend is running and adb reverse tcp:3000 tcp:3000 is active.`);
    }

    throw err;
  }
}

/**
 * Fetch All Users
 * 
 * WHAT IT DOES: Retrieves list of all registered users on campus.
 * WHY IT EXISTS: Required for user discovery and starting conversations.
 * HOW IT WORKS: Executes GET /user.
 * INPUT: None.
 * @returns {Promise<Array<{ id: string|number, name: string, bio?: string }>>}
 */
export async function getUsers() {
  const data = await request('/user', { method: 'GET' });
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch Single User Profile
 * 
 * WHAT IT DOES: Retrieves profile details for a given user ID.
 * WHY IT EXISTS: Used to resolve participant names and conversation creators.
 * HOW IT WORKS: Executes GET /user/profile?user_id={userId}.
 * INPUT: userId (string or number).
 * @param {string|number} userId
 * @returns {Promise<{ id: string|number, name: string, bio?: string }>}
 */
export async function getUserProfile(userId) {
  if (!userId) {
    throw new Error('User ID is required to fetch user profile');
  }
  return await request(`/user/profile?user_id=${encodeURIComponent(userId)}`, {
    method: 'GET',
  });
}

/**
 * Fetch All Conversations
 * 
 * WHAT IT DOES: Retrieves all conversations the current user is part of.
 * WHY IT EXISTS: Populates the main conversation inbox screen.
 * HOW IT WORKS: Executes GET /conversation.
 * INPUT: None.
 * @returns {Promise<Array<{ id: string|number, name: string, createdBy: string|number, participants_ids: Array }>>}
 */
export async function getConversations() {
  const data = await request('/conversation', { method: 'GET' });
  return Array.isArray(data) ? data : [];
}

/**
 * Create a New Conversation
 * 
 * WHAT IT DOES: Creates a direct message (DM) or group conversation.
 * WHY IT EXISTS: Allows students to start new chats from the user directory.
 * HOW IT WORKS: Executes POST /conversation with JSON payload.
 * INPUT:
 *   - type: 'DM' | 'GROUP'
 *   - name: string (conversation title)
 *   - participants_ids: array of user IDs
 * @param {{ type: string, name: string, participants_ids: Array }} payload
 * @returns {Promise<any>} Created conversation object
 */
export async function createConversation({ type, name, participants_ids }) {
  if (!type) {
    throw new Error('Conversation type (DM or GROUP) is required');
  }
  if (!Array.isArray(participants_ids) || participants_ids.length === 0) {
    throw new Error('At least one participant must be selected');
  }

  return await request('/conversation', {
    method: 'POST',
    body: JSON.stringify({
      type,
      name: name || (type === 'DM' ? 'Direct Message' : 'Campus Group'),
      participants_ids,
    }),
  });
}

/**
 * Fetch Messages for a Conversation
 * 
 * WHAT IT DOES: Retrieves message history for a specific conversation ID.
 * WHY IT EXISTS: Populates the chat thread in ChatScreen.
 * HOW IT WORKS: Executes GET /message?conversation_id={conversationId}.
 * INPUT: conversationId (string or number).
 * @param {string|number} conversationId
 * @returns {Promise<{ data: Array<{ id: string|number, content?: string, imageInfo?: string }> }>}
 */
export async function getMessages(conversationId) {
  if (!conversationId) {
    throw new Error('conversation_id is required to fetch messages');
  }
  const result = await request(`/message?conversation_id=${encodeURIComponent(conversationId)}`, {
    method: 'GET',
  });

  // Backend returns either { data: [...] } or direct array [...]
  if (result && Array.isArray(result.data)) {
    return result.data;
  }
  if (Array.isArray(result)) {
    return result;
  }
  return [];
}

/**
 * Send a Text Message
 * 
 * WHAT IT DOES: Posts a new text message to a conversation thread.
 * WHY IT EXISTS: Primary messaging mechanism for CampusConnect.
 * HOW IT WORKS: Executes POST /message with conversation_id and content.
 * INPUT:
 *   - conversationId: string or number
 *   - content: string (message text)
 * @param {string|number} conversationId
 * @param {string} content
 * @returns {Promise<any>}
 */
export async function sendTextMessage(conversationId, content) {
  if (!conversationId) {
    throw new Error('conversation_id is required to send a message');
  }
  const trimmed = (content || '').trim();
  if (!trimmed) {
    throw new Error('Message content cannot be empty');
  }

  return await request('/message', {
    method: 'POST',
    body: JSON.stringify({
      conversation_id: conversationId,
      content: trimmed,
    }),
  });
}

/**
 * Send an Image Message
 * 
 * WHAT IT DOES: Transmits an image formatted as a Base64 string to the conversation.
 * WHY IT EXISTS: Allows sharing photos taken from camera or chosen from gallery.
 * HOW IT WORKS: Executes POST /message with conversation_id and imageInfo.
 * INPUT:
 *   - conversationId: string or number
 *   - imageInfo: string (Base64 data or data URI)
 * @param {string|number} conversationId
 * @param {string} imageInfo
 * @returns {Promise<any>}
 */
export async function sendImageMessage(conversationId, imageInfo) {
  if (!conversationId) {
    throw new Error('conversation_id is required to send an image');
  }
  if (!imageInfo) {
    throw new Error('Image data is required');
  }

  return await request('/message', {
    method: 'POST',
    body: JSON.stringify({
      conversation_id: conversationId,
      imageInfo,
    }),
  });
}
