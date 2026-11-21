# CampusConnect Mobile App (Expo SDK 58 / React Native)

This folder contains the complete cross-platform mobile client for **CampusConnect**.

For full project documentation, architectural diagrams, API contracts, local setup instructions, Render deployment, and viva defense notes, please view the root [README.md](../README.md).

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run unit & error resilience tests
node test/run_tests.js

# 3. Start development server
npx expo start

# 4. Build standalone Android APK
eas build -p android --profile preview
```

### Documentation Directory
- [PROJECT_AUDIT.md](../docs/PROJECT_AUDIT.md) — Technical audit & bug inventory
- [VIVA_NOTES.md](../docs/VIVA_NOTES.md) — 14-section comprehensive viva defense guide
- [VIVA_QUESTIONS.md](../docs/VIVA_QUESTIONS.md) — 25 likely viva examination questions
- [SUBMISSION_CHECKLIST.md](../docs/SUBMISSION_CHECKLIST.md) — Verification checklist & APK build guide
