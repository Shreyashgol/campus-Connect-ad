# STAGE 0 — Audit the Existing NST_AD Chat App

You are working on an existing Expo + React Native JavaScript project located in `chat_app`.

The objective is to upgrade it into a simple campus communication application named **CampusConnect**.

## Strict rules
1. Do not rewrite the entire application.
2. Do not migrate to TypeScript.
3. Do not replace Expo or React Native.
4. Do not introduce Firebase, Supabase, or a new backend.
5. Do not invent API endpoints or backend response fields.
6. Preserve all existing working features.
7. Do not delete existing files until their purpose and dependencies are understood.

## Tasks

### 1. Inspect the project
Inspect:
- package.json and app.json
- App.js and navigation files
- Every screen and reusable component
- API calls and request headers
- Camera and image-picker functionality
- Existing environment/configuration files

### 2. Understand backend communication
Find every backend URL, endpoint, HTTP method, request body, authorization header, and expected response structure.

Create a table documenting:

| Feature | Endpoint | Method | Request format | Response format |
|---|---|---|---|---|

Identify inconsistent server IPs, hardcoded credentials, missing error handling, and assumptions about API responses.

Do not expose actual secrets in the report.

### 3. Identify existing functionality
Classify each feature as:
- Working
- Partially working
- Broken
- Backend support unknown

Check:
- User listing
- Conversation listing
- Direct conversation creation
- Group conversation creation
- Text message sending
- Message fetching
- Image upload and display
- Camera and gallery access

### 4. Create documentation
Create `docs/PROJECT_AUDIT.md` containing:
- Existing architecture
- Screen and navigation flow
- Backend API contract
- Bugs and risks
- Dependencies
- Recommended implementation order
- Backend features that cannot be confirmed

Create `docs/VIVA_NOTES.md` with a beginner-friendly explanation of the existing architecture.

## Important
Do not start implementing new features in this stage.

At the end, give me:
1. A summary of the existing project.
2. A list of confirmed backend capabilities.
3. A list of unsupported or unknown capabilities.
4. The exact files that should be changed in Stage 1.
5. Any backend information you need from me before proceeding.

Keep the explanation simple enough for a third-year computer science student to understand and explain in a viva.