# CampusConnect — Academic Submission Checklist & Verification Report

**Project Title:** CampusConnect  
**Repository Directory:** `chat_app`  
**Framework:** Expo SDK 58, React Native 0.88, React 19  
**Target Platform:** Android (Physical Device & Emulator) / iOS  
**Audit & Upgrade Date:** November 2026  

---

## 1. Completed Features

- [x] **Centralized API Architecture:** Single configurable base URL (`http://localhost:3000`) with `AbortController` timeout handling in `src/services/api.js`.
- [x] **Conversations Inbox (`screens/ConversationScreen.jsx`):**
  - Displays all active chats (DMs and Groups).
  - Avatar initials generation.
  - Category filter chips (`All Chats`, `Direct Messages`, `Groups`, `📢 Notices`).
  - Search filter by title or creator with instant clear.
  - Pull-to-refresh (`RefreshControl`) and auto-refresh on screen focus (`useFocusEffect`).
- [x] **User Discovery & Conversation Initiation (`screens/AllUsers.jsx`):**
  - Live directory of campus students from `GET /user`.
  - Search filter by student name or bio.
  - Multi-user toggle selection (tap to select, tap again to deselect).
  - Deduplication guarantee (no duplicate participant IDs).
  - Form validation: enforces 1 recipient for DM; enforces title and participants for Groups.
  - Direct transition to inbox upon creation.
- [x] **Core Messaging Thread (`screens/ChatScreen.jsx`):**
  - Distinct sent vs. received bubble styles (sent in blue on right; received in white on left).
  - Text messages properly rendered (fixing the original invisible text bug).
  - Sender identification and formatted timestamps.
  - Immediate thread refresh and auto-scroll to bottom after sending.
  - Active 5-second interval polling for incoming messages while focused.
  - Non-empty message validation; Send button disabled while in-flight.
  - `KeyboardAvoidingView` to prevent keyboard overlap on mobile devices.
- [x] **Media Sharing (Camera & Gallery):**
  - Unified action dialog prompting "Take Photo with Camera" or "Choose from Gallery".
  - Base64 encoding with quality optimization (`0.6`) sent to `POST /message`.
  - Inline image rendering in chat threads.
  - 100% cancellation crash-proof (`result.canceled` check).
- [x] **Group Information (`screens/GroupInfoScreen.jsx`):**
  - Accessible via header info icon (`ℹ️`).
  - Displays group title, participant count, and resolves member bios via `GET /user/profile`.
- [x] **Student Profile (`screens/ProfileScreen.jsx`):**
  - Displays student name, ID, bio, active conversation stats, and backend diagnostics.
  - Viva Identity Switcher for testing multi-user interactions on a single device.
- [x] **Campus Announcements:**
  - Noticeboard styling (`📢 CAMPUS ANNOUNCEMENT` gold banners) for broadcast channels.
  - Filterable in inbox.

---

## 2. Tested Scenarios & Verification Matrix

Automated verification suite executed via `node chat_app/test/run_tests.js`:

| Test Category | Test Case | Expected Behavior | Result |
|---|---|---|---|
| **Functional** | `getInitials()` | Returns 2-letter uppercase initials or `?` | **PASS (100%)** |
| **Functional** | `truncateText()` | Truncates text exceeding max length with ellipsis | **PASS (100%)** |
| **Functional** | `formatMessageTime()` | Returns "HH:MM AM/PM" or `null` for invalid input | **PASS (100%)** |
| **Functional** | `toggleUserSelection()` | Tapping user adds ID; tapping again removes ID | **PASS (100%)** |
| **Functional** | Deduplication | Repeated selections never produce duplicate IDs | **PASS (100%)** |
| **Validation** | DM Participant Count | Fails if recipient count $\neq 1$; passes if count $= 1$ | **PASS (100%)** |
| **Validation** | Group Validation | Fails if group name is empty or participants $= 0$ | **PASS (100%)** |
| **Error Handling**| Empty Text Message | Throws descriptive error; blocks submission | **PASS (100%)** |
| **Error Handling**| Picker Cancellation | Returns `null` safely without throwing `TypeError` | **PASS (100%)** |
| **Error Handling**| Route Param Fallback | Missing navigation params resolves to safe defaults | **PASS (100%)** |
| **Network** | Server Unreachable | Throws friendly error advising `adb reverse` check | **PASS (100%)** |
| **Network** | Request Timeout | `AbortController` triggers after 10 seconds | **PASS (100%)** |

---

## 3. Known Issues & Mitigation Strategies

1. **No Backend JWT Authentication:**
   - *Status:* Backend relies on static Basic Auth rather than user login/registration tokens.
   - *Mitigation:* The Profile screen features a "Switch Profile" utility so examiners can switch active student identities during testing without needing login credentials.
2. **HTTP Polling vs. WebSockets:**
   - *Status:* The backend does not expose a WebSocket server.
   - *Mitigation:* Implemented a 5-second polling interval combined with `useFocusEffect` to simulate real-time updates without draining battery when the app is in the background.
3. **Base64 Payload Size:**
   - *Status:* Images are transmitted as Base64 strings in JSON body rather than multipart uploads.
   - *Mitigation:* Photos are compressed with `quality: 0.6`, reducing payloads from 8MB to $\sim 300\text{KB}$.

---

## 4. Backend Requirements

To run CampusConnect against your local backend:
- **Server Port:** `3000`
- **Supported Endpoints:**
  - `GET /user`
  - `GET /user/profile?user_id={id}`
  - `GET /conversation`
  - `POST /conversation`
  - `GET /message?conversation_id={id}`
  - `POST /message` (accepts `{ conversation_id, content }` or `{ conversation_id, imageInfo }`)

---

## 5. Step-by-Step Android Physical Device Testing

1. Connect your Android phone to your computer using a USB cable.
2. Enable **Developer Options** and **USB Debugging** on the phone.
3. Verify the device is recognized:
   ```bash
   adb devices
   ```
4. **Enable Reverse Port Forwarding** (critical step for local development):
   ```bash
   adb reverse tcp:3000 tcp:3000
   ```
   *(This routes requests made by the phone to `http://localhost:3000` directly to your computer's local server).*
5. Start your backend server on port 3000:
   ```bash
   # (in your backend project directory)
   npm start
   ```
6. Start the Expo development server:
   ```bash
   cd chat_app
   npx expo start
   ```
7. Scan the displayed QR code using the **Expo Go** app on your Android device.

---

## 6. Android Standalone APK Build Instructions

CampusConnect is configured in `app.json` and `eas.json` to build a standalone, distributable Android `.apk` file using Expo Application Services (EAS).

### Method A: Cloud Build via EAS (Recommended)
1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Navigate to the `chat_app` directory:
   ```bash
   cd chat_app
   ```
3. Log in to your Expo account:
   ```bash
   eas login
   ```
4. Run the standalone APK build command:
   ```bash
   eas build -p android --profile preview
   ```
5. EAS will compile the Android project in the cloud and return a direct URL to download the `.apk` file.
6. Install the APK on your device:
   ```bash
   adb install CampusConnect.apk
   ```

### Method B: Local Native Prebuild & Gradle Build
If you have Android Studio and Android SDK installed locally:
1. Generate the native Android project:
   ```bash
   cd chat_app
   npx expo prebuild --platform android
   ```
2. Navigate to the generated Android folder and compile the release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
3. The generated release APK will be located at:
   `android/app/build/outputs/apk/release/app-release.apk`
