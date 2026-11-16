# STAGE 4 — Final Testing and Android APK Preparation

Prepare CampusConnect for academic submission.

Read all existing project documentation and inspect the complete application.

## 1. Functional testing

Verify:
- Application starts successfully.
- Navigation works.
- User listing works.
- Conversation listing works.
- Direct conversation creation works.
- Group conversation creation works.
- Messages load correctly.
- Text messages send correctly.
- Message refresh works.
- Search works.
- Profile screen works.
- Image sharing works if supported.

Do not mark a feature as passed without actually testing it.

## 2. Error testing

Check:
- Empty input
- Network unavailable
- Backend unavailable
- Invalid conversation ID
- Empty conversation list
- Empty message list
- Image picker cancellation
- Failed image upload
- Unexpected API response

## 3. Android compatibility
- Verify Android permissions.
- Verify camera and gallery permissions if used.
- Verify application icon and name.
- Verify app configuration.
- Check for development-only localhost or LAN URLs.
- Ensure the configured backend address is reachable from a physical Android device.

## 4. Viva documentation

Create `docs/VIVA_NOTES.md` containing:

1. Project introduction.
2. Problem statement.
3. Technologies used and why.
4. Application architecture.
5. Navigation flow.
6. How API communication works.
7. How users and conversations are fetched.
8. How direct and group conversations are created.
9. How messages are sent and displayed.
10. How image sharing works, if implemented.
11. Important functions and their responsibilities.
12. Challenges faced and how they were resolved.
13. Known limitations.
14. Possible future improvements.

Use simple language and examples from the actual implementation.

Also create `docs/VIVA_QUESTIONS.md` with at least 20 likely viva questions and concise answers based on the actual source code.

## 5. Final report

Create `docs/SUBMISSION_CHECKLIST.md` with:
- Completed features
- Tested features
- Known issues
- Backend requirements
- APK build instructions
- Physical-device testing results

Do not claim the app is submission-ready if a critical feature or backend connection is broken.

At the end, provide the exact commands required to build the Android APK.