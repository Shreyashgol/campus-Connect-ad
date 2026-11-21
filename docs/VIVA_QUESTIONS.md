# CampusConnect — 25 Likely Viva Questions & Answers

This document prepares students for project reviews, lab evaluations, and final viva examinations. All questions and answers are grounded directly in the actual source code of CampusConnect.

---

### Q1: What is the primary difference between React Native and standard React for the web?
**Answer:** React for the web compiles JSX into standard HTML elements (such as `<div>`, `<span>`, `<p>`) that run inside a web browser's DOM. React Native replaces the browser DOM with native bridge bindings: components like `<View>`, `<Text>`, and `<TouchableOpacity>` are translated directly into real native platform widgets (`android.view.ViewGroup`, `android.widget.TextView` on Android, and `UIView`, `UILabel` on iOS).

### Q2: What is Expo and why did we use it instead of pure React Native CLI?
**Answer:** Expo is a framework and toolchain built around React Native. It eliminates the requirement of configuring Xcode or Android Studio locally by managing native build tools and Continuous Native Generation (CNG). Furthermore, Expo provides pre-tested, SDK-compatible native hardware plugins (like `expo-camera` and `expo-image-picker`) that handle device permissions and hardware integration consistently across Android and iOS.

### Q3: Explain the navigation hierarchy used in CampusConnect.
**Answer:** CampusConnect utilizes React Navigation 7 with a two-tier navigation structure:
1. **Bottom Tab Navigator (`App.js`):** Houses top-level tabs: `Conversations` (Chats), `AllUsers` (Find Users), `Profile` (My Profile), and media utility screens (`Gallery`, `Camera`, `Live Cam`).
2. **Native Stack Navigator (`screens/Stack.jsx`):** Nested inside the `Conversations` tab. It manages hierarchical screen transitions (pushing `ChatScreen` and `GroupInfoScreen` onto the stack with automatic platform-specific back buttons).

### Q4: How is route data passed between screens in React Navigation?
**Answer:** Route parameters are passed via the second argument of `navigation.navigate()`. For example, tapping a conversation runs:
```javascript
navigation.navigate('Chat', {
  data: {
    conversationId: item.id,
    name: item.name,
    participants: item.participants_ids
  }
});
```
In `ChatScreen.jsx`, these parameters are accessed safely via `route?.params?.data`.

### Q5: What was the cause of the fatal crash when opening conversations in the original codebase?
**Answer:** The original code in `Stack.jsx` and `ChatScreen.jsx` attempted to read nested properties like `route.params.data.name` without checking if `route.params` or `route.params.data` was defined. If a user navigated without passing parameters, JavaScript threw an uncaught `TypeError: Cannot read properties of undefined`, crashing the app. We fixed this using optional chaining and fallback defaults (`route?.params?.data?.name || 'Chat'`).

### Q6: Why were text messages completely invisible in the original `ChatScreen`?
**Answer:** Inside `ChatScreen.jsx`, the `.map()` loop rendering messages had a conditional:
`isImage ? <Image .../> : <Text></Text>`.
The developer forgot to place the message text inside the tags, leaving it completely empty. We fixed this by rendering `<Text style={styles.messageText}>{item.content}</Text>`.

### Q7: What caused the fatal crash when a user cancelled the photo picker?
**Answer:** In `ImagePicker.jsx` and `ChatScreen.jsx`, the line `setImage(result.assets[0].uri)` was executed unconditionally outside the `if (!result.canceled)` block. When a user cancelled the picker dialog, `result.canceled` was `true` and `result.assets` was `undefined`. Attempting to read index `0` resulted in an immediate `TypeError`. We resolved this by adding a guard:
`if (result.canceled || !result.assets || result.assets.length === 0) return;`.

### Q8: What was the missing import bug in `ChatScreen`?
**Answer:** When media library permission was denied, `ChatScreen.jsx` called `Alert.alert('Permission required', ...)`. However, `Alert` was never imported from `'react-native'`, which caused a fatal `ReferenceError: Alert is not defined` whenever a user denied permissions.

### Q9: Why was hardcoding IP addresses like `10.7.1.89` and `10.7.1.51` problematic?
**Answer:** `10.7.1.89` and `10.7.1.51` are private IPv4 addresses on a specific campus LAN. They fail as soon as the developer switches networks, and using two different IPs meant creating conversations targeted one machine while fetching messages targeted another. We solved this by centralizing the API configuration in `src/config/api.js` using `http://localhost:3000` combined with Android reverse port forwarding (`adb reverse tcp:3000 tcp:3000`).

### Q10: How does Android reverse port forwarding (`adb reverse`) work?
**Answer:** Running `adb reverse tcp:3000 tcp:3000` instructs the Android Debug Bridge daemon to forward any TCP connections made to `localhost:3000` on the Android device back over the USB connection to port `3000` on the development computer. This allows the mobile app to communicate with a local backend server without depending on Wi-Fi IP stability.

### Q11: Explain the purpose of `AbortController` in our `api.js` service.
**Answer:** The standard JavaScript `fetch()` API does not include a default network timeout. If a remote server is unreachable, the request promise can hang indefinitely, leaving the UI stuck on a loading spinner. An `AbortController` binds a 10-second timer to the request signal (`signal: controller.signal`). If the timer expires before a response is received, `controller.abort()` cancels the network socket and throws a clear timeout error.

### Q12: How does the app achieve message updates without WebSockets?
**Answer:** The backend only exposes standard HTTP REST endpoints and does not implement a WebSocket server. To provide responsive chat updates, CampusConnect uses:
1. **Focus Refresh (`useFocusEffect`):** Refetches messages automatically when the student opens or returns to a chat.
2. **Periodic Interval Polling:** A lightweight `setInterval` checks `GET /message` every 5 seconds while `ChatScreen` is actively focused. The timer is automatically cleared when the student navigates away.

### Q13: How does the toggle selection logic in `AllUsers.jsx` prevent duplicate participant IDs?
**Answer:** 
```javascript
const toggleUserSelection = (userId) => {
  setSelectedUsers((prev) =>
    prev.includes(userId)
      ? prev.filter((id) => id !== userId)
      : [...prev, userId]
  );
};
```
If `selectedUsers` already contains the `userId`, JavaScript's `filter` method removes it; if absent, it appends it. This guarantees no user ID appears more than once.

### Q14: What validation is enforced before creating a conversation?
**Answer:**
1. A conversation type (`DM` or `GROUP`) must be selected.
2. At least one participant must be selected.
3. For **DM**: Exactly 1 recipient must be selected.
4. For **Campus Group**: A non-empty group name must be entered.

### Q15: How does CampusConnect visually differentiate sent vs. received messages?
**Answer:** Using [MessageBubble.jsx](file:///Users/shreyashgolhani/Desktop/NST_AD/chat_app/src/components/MessageBubble.jsx):
- **Sent Messages:** Aligned to the right (`justifyContent: 'flex-end'`), styled with brand blue background (`#0066cc`), white text, and light timestamp.
- **Received Messages:** Aligned to the left (`justifyContent: 'flex-start'`), styled with white background, dark text, participant name header, and gray timestamp.

### Q16: How is image sharing implemented given the current backend contract?
**Answer:** The backend does not provide a multipart `/upload` endpoint; instead, `POST /message` accepts an `imageInfo` property. When a photo is selected via camera or gallery, `expo-image-picker` encodes it as a Base64 string. The client sends `{ conversation_id, imageInfo: "data:image/jpeg;base64,..." }`. In `MessageBubble.jsx`, `<Image source={{ uri: message.imageInfo }} />` decodes and displays the photo.

### Q17: Why did we compress the image quality to `0.6` before Base64 encoding?
**Answer:** Base64 encoding inflates raw binary file size by approximately 33%. A raw 12-megapixel smartphone photo can easily exceed 8MB, resulting in a 10MB+ JSON string that can crash the mobile bridge or exceed HTTP request body limits. Compressing quality to `0.6` reduces the payload to a few hundred kilobytes, ensuring fast and reliable uploads.

### Q18: What is the difference between `CameraScreen` and `RawCameraScreen`?
**Answer:**
- `CameraScreen` uses `expo-image-picker`'s `launchCameraAsync`. It delegates camera operations to the mobile operating system's built-in camera app. It is simple, reliable, and battery-efficient.
- `RawCameraScreen` uses `expo-camera`'s `<CameraView>`. It embeds a live camera viewfinder directly inside the React Native view hierarchy, allowing custom shutter buttons and UI overlays.

### Q19: What is the N+1 network query problem observed in `ConversationScreen`?
**Answer:** In the initial code, `GET /conversation` returned an array of $N$ conversations, but each conversation only contained a `createdBy` user ID. The client then executed $N$ separate GET requests to `/user/profile?user_id=...` using `Promise.all` to resolve creator names. In production, this creates unnecessary network latency and server load; the ideal backend optimization is to return the populated creator name directly in the conversation payload.

### Q20: Why is `KeyboardAvoidingView` critical on mobile chat screens?
**Answer:** When a user taps the text input on a physical mobile device, the virtual software keyboard slides up from the bottom of the screen. Without `KeyboardAvoidingView`, the keyboard covers the text input, preventing the user from seeing what they are typing. `KeyboardAvoidingView` dynamically shifts the view up to keep the message composer visible above the keyboard.

### Q21: How are Campus Announcements implemented without a new backend table?
**Answer:** We followed the project rule prohibiting new backend endpoints. Announcements are represented using the verified `GROUP` entity with announcement identifiers in the title or type. The client recognizes these groups and renders them with specialized noticeboard styling (`📢 CAMPUS ANNOUNCEMENT` gold badge) in both the inbox and chat threads.

### Q22: What is the role of `SafeAreaProvider` and `SafeAreaView`?
**Answer:** Modern smartphones have physical display cutouts (notches, dynamic islands, camera punch-holes) and bottom navigation bars. `SafeAreaProvider` calculates the safe insets of the physical screen so content is not clipped or rendered under the status bar or rounded corners.

### Q23: Why do we use `useCallback` when defining fetch functions in screens?
**Answer:** In React, functions defined inside a component are recreated on every render. If an asynchronous fetch function is passed to `useEffect` or `useFocusEffect` as a dependency, recreating the function causes an infinite fetch loop. Wrapping the function in `useCallback` memoizes its reference so it is only recreated if its explicit dependencies change.

### Q24: What Android permissions are configured in `app.json`?
**Answer:**
- `android.permission.CAMERA`: Grants permission to capture photos via the camera hardware.
- `android.permission.READ_MEDIA_IMAGES`: Grants permission to access photos in the media gallery on Android 13+.
- `android.permission.RECORD_AUDIO`: Required for microphone access.

### Q25: What commands build the final production Android APK?
**Answer:** Using Expo Application Services (EAS):
1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Configure build profile: `eas build:configure`
4. Build standalone Android APK: `eas build -p android --profile preview`
The APK can then be installed directly on any physical Android device via `adb install <file>.apk`.
