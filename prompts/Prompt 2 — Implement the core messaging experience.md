# STAGE 2 — Implement CampusConnect Core Messaging

Continue using the existing Expo + React Native JavaScript project and the existing backend.

Read:
- `docs/PROJECT_AUDIT.md`
- `docs/VIVA_NOTES.md`

Do not invent endpoints or modify the backend contract without approval.

## Features

### 1. Conversations screen
- Display existing conversations.
- Show conversation name.
- Show the latest message preview if available from the API.
- Show a suitable fallback when no message exists.
- Add loading, empty, and error states.
- Allow users to open a conversation.

### 2. User discovery
- Display users returned by the existing API.
- Allow selecting multiple users.
- Allow deselecting users.
- Prevent duplicate selections.
- Display the number of selected participants.
- Validate required input before creating a conversation.

### 3. Direct and group conversations
- Preserve the existing DM and GROUP conversation types.
- Allow creating a direct conversation.
- Allow creating a group with a name and selected participants.
- Validate group name and participant selection.
- Display success or failure feedback.

Only use fields and endpoints confirmed by the audit.

### 4. Chat screen
Implement a clean and readable messaging interface.

Each message should display:
- Message text
- Sender identification, when available
- Timestamp, when available
- Image preview, when supported

Use different visual styles for sent and received messages.

### 5. Sending messages
- Prevent empty messages.
- Disable or indicate the send button while a request is in progress.
- Send messages using the existing API.
- Clear the input only after a successful send.
- Refresh or update the message list after sending.
- Display a useful error if sending fails.

### 6. Refresh behavior
- Refresh messages when opening a conversation.
- Refresh conversations when returning to the conversation list.
- Use a suitable approach supported by the current backend.
- Do not claim real-time messaging unless the backend actually supports it.

## UI requirements
- Keep the design simple and consistent.
- Support different Android screen sizes.
- Handle keyboard appearance correctly.
- Avoid unnecessary animations and complex dependencies.

## Viva requirements
Add explanatory comments to:
- Message fetching
- Message sending
- Conversation creation
- Participant selection
- Navigation parameter handling
- Loading and error handling

Update `docs/VIVA_NOTES.md` with a simple explanation of the message flow:

User types message → UI validates input → API service sends request → backend processes request → UI updates the conversation.

## Acceptance criteria
A user must be able to:
1. Open the application.
2. View conversations.
3. Find users.
4. Create a direct or group conversation.
5. Open a conversation.
6. Send a text message.
7. See the message in the conversation.

Test each flow and report any backend limitation instead of pretending it works.